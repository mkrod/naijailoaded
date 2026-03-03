import { useEffect, useState } from 'react';

interface Prop {
  perView: number;
  data: any[];
}

interface Return {
  startEnd: { start: number, end: number };
  currentFpPage: number
  setCurrentFpPage: React.Dispatch<React.SetStateAction<number>>;
  actions: { cantPrev: boolean, cantNext: boolean };
}

const usePagination = ({ perView, data }: Prop): Return => {

  const [currentFpPage, setCurrentFpPage] = useState<number>(1);
  const [startEnd, setStartEnd] = useState<{ start: number, end: number }>({ start: 0, end: perView });
  const [actions, setActions] = useState<{ cantPrev: boolean, cantNext: boolean }>({ cantPrev: true, cantNext: true });


  useEffect(() => {
    if (!data) return;
    setStartEnd({
      start: ((currentFpPage * perView) - perView),
      end: currentFpPage * perView,
    })
  }, [currentFpPage, data]);

  useEffect(() => {
    setActions({
      cantPrev: currentFpPage === 1,
      cantNext: perView * currentFpPage >= data.length
    })
  }, [currentFpPage, data]);

  return { currentFpPage, setCurrentFpPage, startEnd, actions }
}

export default usePagination;