'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { solveSudoku, canWePlace, Board } from '../lib/solver';
import Image from 'next/image';

export default function Home() {
  const emptyBoard: Board = useMemo(
    () => Array(9).fill(null).map(() => Array(9).fill('.')),
    []
  );

  const [board, setBoard] = useState<Board>(emptyBoard);
  const [inputBoard, setInputBoard] = useState<Board>(emptyBoard);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );

  const handleChange = (row: number, col: number, value: string) => {
    const val = value === '' ? '.' : value;

    if (!/^[1-9.]?$/.test(val)) {
      setError('Only digits 1-9 or empty cells are allowed.');
      return;
    }

    const newInputBoard: Board = inputBoard.map((r) => [...r]);
    newInputBoard[row][col] = val;
    setInputBoard(newInputBoard);

    if (val !== '.' && !canWePlace(newInputBoard, row, col, val)) {
      setError(`❌ ${val} can't be placed at row ${row + 1}, column ${col + 1}.`);
    } else {
      setError(null);
    }

    const newBoard: Board = board.map((r) => [...r]);
    newBoard[row][col] = val;
    setBoard(newBoard);
  };

  const handleSolve = async () => {
    const boardCopy: Board = inputBoard.map((row) => [...row]);
    setLoading(true);
    try {
      const isValid = boardCopy.every((row, rIdx) =>
        row.every((cell, cIdx) => cell === '.' || canWePlace(boardCopy, rIdx, cIdx, cell))
      );
      if (!isValid) throw new Error('Invalid board: Some inputs conflict with Sudoku rules.');

      await new Promise((res) => setTimeout(res, 500)); // simulate loading

      if (solveSudoku(boardCopy)) {
        setBoard(boardCopy);
        setError(null);
      } else {
        throw new Error('No solution exists for the given Sudoku puzzle.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBoard(emptyBoard);
    setInputBoard(emptyBoard);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    const navigate = (r: number, c: number) => {
      const next = inputRefs.current[r]?.[c];
      if (next) next.focus();
    };
    switch (e.key) {
      case 'ArrowUp':
        if (row > 0) navigate(row - 1, col);
        break;
      case 'ArrowDown':
        if (row < 8) navigate(row + 1, col);
        break;
      case 'ArrowLeft':
        if (col > 0) navigate(row, col - 1);
        break;
      case 'ArrowRight':
        if (col < 8) navigate(row, col + 1);
        break;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-gray-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Sudoku Solver</h1>

      <p className="text-md text-gray-700 mb-2 max-w-xl text-center">
        Enter a Sudoku puzzle. Use digits 1–9 for known values and leave cells empty if unknown.
      </p>

      <div className="w-full max-w-[360px] grid grid-cols-9 gap-0.5 rounded-md">
        {Array.from({ length: 9 }).map((_, row) =>
          Array.from({ length: 9 }).map((_, col) => {
            const inputVal = inputBoard[row][col];
            const solvedVal = board[row][col];
            const isSolved = inputVal === '.' && solvedVal !== '.';
            const isBoldBottom = row === 2 || row === 5;
            const isBoldRight = col === 2 || col === 5;
            const isInvalid =
              inputVal !== '.' &&
              !canWePlace(inputBoard, row, col, inputVal);

            return (
              <input
                key={`${row}-${col}`}
                type="text"
                maxLength={1}
                value={solvedVal === '.' ? '' : solvedVal}
                onChange={(e) => handleChange(row, col, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, row, col)}
                ref={(el) => {
                  inputRefs.current[row][col] = el;
                }}
                className={`w-10 h-10 text-center text-lg font-semibold border focus:outline-none 
                  ${isSolved ? 'bg-green-300' : isInvalid ? 'bg-red-200' : 'bg-white'} 
                  ${isBoldBottom ? 'border-b-4 border-b-gray-800' : 'border-b'}
                  ${isBoldRight ? 'border-r-4 border-r-gray-800' : 'border-r'}
                  text-gray-800`}
              />
            );
          })
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSolve}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-700 rounded text-lg shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Solving...
            </>
          ) : (
            'Solve Sudoku'
          )}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-md shadow"
        >
          Reset
        </button>
      </div>

      {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}

      <div className="mt-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Example:</h2>
        <p className="text-gray-700 mb-2">This is an example of a Sudoku input you can type manually:</p>
        <div className="inline-block border border-gray-600 p-2 bg-white">
          <Image src="/soduku.png" alt="Sudoku Example" width={200} height={200} />
        </div>
      </div>
    </main>
  );
}
