import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateSquares } from "@/app/utils/generate-squares";
import { validateBoardConfig } from "@/lib/board-config";
import { FACES_ACCESS_COOKIE } from "@/lib/faces";
import {
  bindFacesGrant,
  getFacesAccessGrant,
  getSession,
  saveSession,
  withSessionLock,
} from "@/lib/session-store";
import { Board } from "@/model/board";
import { squaresForFaceSet } from "@/model/deck/emotion-video";
import type { FaceSet } from "@/model/deck/face-emotion";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import type { GameConfig } from "@/store/config-store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const {
    hostToken,
    boardConfig,
    faceSet: requestedFaceSet,
  }: {
    hostToken: string;
    boardConfig: GameConfig;
    faceSet?: FaceSet;
  } = await req.json();

  const facesToken = (await cookies()).get(FACES_ACCESS_COOKIE)?.value;

  return withSessionLock(id, async () => {
    const session = await getSession(id);
    if (!session)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.hostToken !== hostToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const configError = validateBoardConfig(boardConfig);
    if (configError)
      return NextResponse.json({ error: configError }, { status: 400 });
    if (session.players.length < 2)
      return NextResponse.json({ error: "Min 2 players" }, { status: 400 });
    if (session.started)
      return NextResponse.json({ error: "Already started" }, { status: 409 });

    // Player(id: number, name: string) — id è l'indice numerico
    const players = session.players.map(
      (p) => new Player(Number(p.id), p.name),
    );

    // Fotografie FACES solo se l'host ha usato un codice valido per una
    // partita multigiocatore (cookie d'accesso) non ancora usato da un'altra
    // partita: il permesso viene legato a questa partita, così i telefoni dei
    // giocatori possono vedere le foto dopo aver accettato il disclaimer
    const hostGrant =
      requestedFaceSet === "faces" && facesToken
        ? await getFacesAccessGrant(facesToken)
        : null;
    const facesGrantId =
      hostGrant && (await bindFacesGrant(hostGrant, id)) ? hostGrant : null;

    const faceSet = facesGrantId ? "faces" : "ai";

    // Replica di config-store.ts:createGame()
    const squaresJSON = squaresForFaceSet(
      boardConfig.customSquares?.length === boardConfig.numSquares
        ? boardConfig.customSquares
        : generateSquares(
            boardConfig.numSquares,
            boardConfig.squareTypes,
            boardConfig.specialPercentage / 100,
          ),
      faceSet,
    );

    const board = Board.fromJSON(
      {
        playersPosition: players.map((p) => ({
          playerId: p.getId(),
          position: 0,
        })),
        squares: squaresJSON,
      },
      players,
    );

    const game = new Game(
      board,
      6,
      boardConfig.battlesEnabled ?? true,
      faceSet,
    );

    if (facesGrantId) session.facesGrantId = facesGrantId;
    session.started = true;
    session.gameState = game.toJSON();
    session.currentPlayerId = String(game.getPlayers()[0].getId());

    await saveSession(id, session);
    return NextResponse.json({ ok: true });
  });
}
