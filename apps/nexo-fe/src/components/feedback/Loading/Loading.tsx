export type LoadingScreenProps = {
  label: string;
};

export const LoadingScreen = ({ label }: LoadingScreenProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  );
};
