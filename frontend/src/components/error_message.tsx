export default function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{message}</div>;
}
