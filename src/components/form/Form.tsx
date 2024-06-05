import React, { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormData, RepoData, UserData } from '../../utils/models';
import { request } from '../../utils/request';


const schema = yup.object().shape({
  input: yup.string().when('type', {
    is: (val: string) => val === 'user',
    then: (schema) => schema
      .required('Введите имя пользователя')
      .matches(/^[A-z]+$/, 'Допускаются только латинские буквы верхнего и нижнего регистра')
      .min(4, 'Неверно заполнено имя. Минимум 4 символа')
      .max(7, 'Неверно заполнено имя. Максимум 7 символов'),
    otherwise: (schema) => schema
      .required('Введите название репозитория в формате owner/repo')
      .matches(/^[a-z-]+\/[a-z-]+$/, 'Неверно заполнено название репозитория. Допускаются только латинские буквы нижнего регистра и знак "-"')
      .min(11, 'Неверно заполнено название репозитория. Минимум 11 символов')
      .max(19, 'Неверно заполнено название репозитория. Максимум 19 символов')
  }),
  type: yup.mixed<'user' | 'repo'>().oneOf(['user', 'repo']).required('Выберите тип')
});

export const Form: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm<FormData>({
    defaultValues: {
        input: '',
        type: 'user'
    },
    resolver: yupResolver(schema)
  });

  const [data, setData] = useState<UserData | RepoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<FormData> = async ({ input, type }) => {
    setError(null);
    setData(null);
    const url = type === 'user'
      ? `https://api.github.com/users/${input}`
      : `https://api.github.com/repos/${input}`;

    try {
      const serverData = await request(url);
      setData(serverData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => {
        reset({ input: '', type });
      }, 3000);
    }
  };

  const selectedField = watch('type', 'user'); 
  console.log(selectedField)

  const errorСhecking  = errors.input?.message || errors.type?.message || errors.root?.message || error;
  console.log(errors)
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select {...field} onChange={(e) => {
                const selectedType = e.target.value as 'user' | 'repo';
                field.onChange(selectedType);
                reset({ input: '', type: selectedType });
              }}>
                <option value="user">User</option>
                <option value="repo">Repo</option>
              </select>
            )}
          />
          {errors.type && <p>{errors.type.message}</p>}
        </div>
        <div>
          <input
            type="text"
            placeholder={selectedField === 'user' ? 'Имя пользователя...' : 'Репозиторий...'}
            {...register('input')}
          />
          {errors.input && <p>{errors.input.message}</p>}
        </div>
        <button type="submit" disabled={!!errorСhecking}>Отправить</button>
      </form>

      {error && <p>{error}</p>}

      {data && (
        <div>
          {('public_repos' in data) ? (
            <div>
              <p>Full Name: {data.login}</p>
              <p>Repositories: {data.public_repos}</p>
            </div>
          ) : (
            <div>
              <p>Repository Name: {data.full_name}</p>
              <p>Stars: {data.stargazers_count}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};







