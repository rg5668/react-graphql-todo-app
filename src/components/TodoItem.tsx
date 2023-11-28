import { useEffect, useRef, useState } from 'react';
import { IList } from '../types/todos';
import { FiEdit, FiMinusCircle } from 'react-icons/fi';

interface TodoItemProps {
    item: IList;
    handleRemove: (options: { variables: { id: number } }) => void;
    handleUpdate: (options: { variables: IList }) => void;
}
const TodoItem = ({ item, handleRemove, handleUpdate }: TodoItemProps) => {
    const [edit, setEdit] = useState(false);
    const [task, setTask] = useState(item.text);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleTextChange = (item: IList) => {
        setEdit(!edit);
        if (edit) {
            handleUpdate({ variables: { id: item.id, text: item.text, checked: item.checked } });
        }
    };

    useEffect(() => {
        inputRef?.current?.focus();
    }, [edit]);

    return (
        <li className="flex items-center justify-between p-5 my-3 text-2xl duration-300 hover:scale-105 border-2 rounded-md shadow-md">
            <div className="flex items-center w-10/12">
                <input
                    type="checkbox"
                    onChange={() => handleUpdate({ variables: { id: item.id, text: task, checked: !item.checked } })}
                    checked={item.checked}
                    className="hover:scale-105 hover:cursor-pointer"
                />
                <input
                    type="text"
                    disabled={!edit}
                    value={task}
                    ref={inputRef}
                    onChange={(e) => setTask(e.target.value)}
                    className={`outline-none h-[25px] text-xl w-full mx-5 px-3 disabled:bg-transparent focus:border-b ${
                        item.checked && 'line-through'
                    } text-stone-500`}
                />
            </div>
            <div className="flex justify-between w-1/6">
                <FiEdit
                    onClick={() => handleTextChange({ id: item.id, text: task, checked: item.checked })}
                    className="hover:scale-105 hover:cursor-pointer"
                />
                <FiMinusCircle
                    onClick={() => handleRemove({ variables: { id: item.id } })}
                    className="hover:scale-105 hover:cursor-pointer"
                />
            </div>
        </li>
    );
};

export default TodoItem;
