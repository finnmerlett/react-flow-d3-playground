import { ReactFlowExample } from './react-flow-example.tsx';

export default function App() {
  return (
    <div className="flex h-full place-content-center">
      <div className="my-8 mt-10 w-8/12 rounded border border-gray-200 p-4 shadow-md dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
        <ReactFlowExample />
      </div>
    </div>
  );
}
