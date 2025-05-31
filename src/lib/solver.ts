export type Board = string[][];

export function canWePlace(board: Board, row: number, col: number, num: string): boolean {
  for (let j = 0; j < 9; j++) {
    if (board[row][j] === num && j !== col) return false;
    if (board[j][col] === num && j !== row) return false;
  }

  const r = Math.floor(row / 3) * 3;
  const c = Math.floor(col / 3) * 3;

  for (let i = r; i < r + 3; i++) {
    for (let j = c; j < c + 3; j++) {
      if (board[i][j] === num && (i !== row || j !== col)) return false;
    }
  }

  return true;
}

export function solveSudoku(board: Board, row = 0, col = 0): boolean {
  if (row === 9) return true;
  if (col === 9) return solveSudoku(board, row + 1, 0);
  if (board[row][col] !== '.') return solveSudoku(board, row, col + 1);

  for (let i = 1; i <= 9; i++) {
    const num = i.toString();
    if (canWePlace(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board, row, col + 1)) return true;
      board[row][col] = '.';
    }
  }

  return false;
}
