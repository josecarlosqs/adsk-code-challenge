import type { Request, Response } from 'express';

export const searchBooks = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [],
  });
};
