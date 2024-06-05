export const request = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка сети');
    }
    const data = await response.json();
    return data;
  };