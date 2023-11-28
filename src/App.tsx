import { useMutation, useQuery } from '@apollo/client';
import { ADD_TODO, GET_TODOS, REMOVE_TODO, UPDATE_TODO } from './apollo/todos';
import TodoItem from './components/TodoItem';
import { AllTodosCache, IList } from './types/todos';
import { useState } from 'react';

function App() {
    const [input, setInput] = useState('');
    const { loading, error, data } = useQuery<AllTodosCache>(GET_TODOS);

    const [addTodo] = useMutation(ADD_TODO, {
        update(cache, { data: { createTodo } }) {
            // readQuery 메서드를 사용해 캐시에 직접 GraphQL 쿼리를 실행할 수 있다.
            const previousTodos = cache.readQuery<AllTodosCache>({ query: GET_TODOS })?.allTodos;
            // writeQuery 메서드를 사용하면 GraphQL 쿼리와 일치하는 형태로 캐시에 데이터를 사용할 수 있다.
            cache.writeQuery({
                query: GET_TODOS,
                data: {
                    allTodos: [createTodo, ...(previousTodos as IList[])],
                },
            });
        },
    });

    const [removeTodo] = useMutation(REMOVE_TODO, {
        update(cache, { data: { removeTodo } }) {
            // modify를 사용하여 해당 필드에 있는 캐시와 일치하지 않는것만 새로운 배열로 반환.
            // 캐시를 업데이트할 필요가 있을 경우, 아래와 같이 cache.modify를 사용할 수 있다.
            cache.modify({
                fields: {
                    allTodos(currentTodos) {
                        console.log(currentTodos, removeTodo);
                        return currentTodos.filter((todo: { __ref: string }) => todo.__ref !== `Todo:${removeTodo.id}`);
                    },
                },
            });

            // 캐시를 삭제하는 방법
            cache.evict({ id: `Todo:${removeTodo.id}` });
        },
    });

    // Root Query에서 직접 컨트롤하지 않고 직접적으로 접근하기때문에, 옵션을 따로 사용하지 않아도됨.
    const [updateTodo] = useMutation(UPDATE_TODO);

    const sort = (list: IList[]): IList[] => {
        const newList = [...list];
        return newList.sort((a, b) => +a.checked - +b.checked);
    };

    const counter = (): string => {
        if (data?.allTodos) {
            const competed = data.allTodos.filter((todo) => todo.checked);
            return `${competed.length}/${data.allTodos.length}`;
        }
        return '0/0';
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (input.trim() === '') return;

        addTodo({
            variables: {
                text: input,
                checked: false,
            },
        });

        setInput('');
    };

    if (error) return <div>Network error</div>;

    return (
        <div className="flex flex-col items-center">
            <div className="mt-5 text-3xl">
                Todo App <span className="text-sm">({counter()})</span>
            </div>

            <div className="w-5/6 md:w-1/2 lg:w-3/5">
                <form
                    onSubmit={handleSubmit}
                    className="flex justify-between p-5 my-5 text-4xl border-2 rounded-md shadow-md"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="할 일을 작성해주세요"
                        type="text"
                        className="outline-none border-b text-xl w-10/12 focus:border-b-[3px]"
                    />
                    <div>
                        <button type="submit" className="hover:scale-105">
                            +
                        </button>
                    </div>
                </form>

                {loading ? (
                    <div>loading...</div>
                ) : (
                    <ul>
                        {data &&
                            sort(data.allTodos).map((item) => (
                                <TodoItem
                                    key={item.id}
                                    item={item}
                                    handleRemove={removeTodo}
                                    handleUpdate={updateTodo}
                                />
                            ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default App;
