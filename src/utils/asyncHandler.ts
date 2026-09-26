import { Request, Response, NextFunction, RequestHandler } from 'express';

export type AsyncController<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = <TReq extends Request = Request>(
  fn: AsyncController<TReq>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };
};

export default asyncHandler;
