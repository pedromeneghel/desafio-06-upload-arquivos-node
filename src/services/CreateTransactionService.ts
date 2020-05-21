import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransacionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransacionRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    const categoriesRepository = getRepository(Category);

    let transctionCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transctionCategory) {
      transctionCategory = categoriesRepository.create({
        title: category,
      });
    }

    await categoriesRepository.save(transctionCategory);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transctionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
