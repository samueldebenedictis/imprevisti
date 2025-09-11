import type { Meta, StoryObj } from "@storybook/react";
import Board from "../src/app/components/board";
import Square from "../src/app/components/square";

const meta = {
  title: "Example/Board",
  component: Board,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Board>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    squares: [
      <Square key={0} number={0} squareType="normal" />,
      <Square key={1} number={1} squareType="normal" />,
      <Square key={2} number={2} squareType="mime" />,
      <Square key={3} number={3} squareType="normal" />,
      <Square key={4} number={4} squareType="quiz" />,
      <Square key={5} number={5} squareType="normal" />,
      <Square key={6} number={6} squareType="move" moveValue={1} />,
      <Square key={7} number={7} squareType="move" moveValue={-1} />,
      <Square key={8} number={8} squareType="normal" />,
    ],
  },
  render: () => (
    <Board
      squares={[
        <Square key={0} number={0} squareType="first" />,
        <Square key={1} number={1} squareType="normal" />,
        <Square key={2} number={2} squareType="mime" />,
        <Square key={3} number={3} squareType="normal" />,
        <Square key={4} number={4} squareType="quiz" />,
        <Square key={5} number={5} squareType="normal" />,
        <Square key={6} number={6} squareType="move" moveValue={1} />,
        <Square key={7} number={7} squareType="move" moveValue={-1} />,
        <Square key={8} number={8} squareType="last" />,
      ]}
    />
  ),
};

export const EmptyBoard: Story = {
  args: {
    squares: [],
  },
};

export const SingleSquare: Story = {
  args: {
    squares: [<Square key={0} number={0} squareType="normal" />],
  },
};

export const LargeBoard: Story = {
  args: {
    squares: Array.from(Array(25).keys()).map((i) => (
      <Square
        key={i}
        number={i}
        squareType={i === 0 ? "first" : i === 24 ? "last" : "normal"}
      />
    )),
  },
};
