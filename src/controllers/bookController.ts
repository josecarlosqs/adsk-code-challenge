import type { Request, Response } from 'express';
import { booksService } from '../services';
import { matchedData, Result, validationResult } from 'express-validator';

export const searchBooks = async (req: Request, res: Response) => {
  const validation: Result = validationResult(req),
        validationArray = validation.array();

  if (validationArray.length > 0) {
    return res.status(400).json({
      success: false,
      message: validationArray.map((err) => {
        return `${err.msg} for ${err.path} query param`;
      })
    })
  }

  const data = matchedData(req);

  data.q = data.q.replace(/\s+/g, '+');

  const result = await booksService.search(data.q, data.page);

  res.status(200).json({
    success: true,
    data: result.map(book => ({
      title: book.title,
      author: book.author
    })),
  });
};
