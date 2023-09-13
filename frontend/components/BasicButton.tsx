
type BasicButtonProps = {
    text: string;
    onClick: () => void;
    className?: string;
};
export default function BasicButton({ text, onClick, className }: BasicButtonProps) {
    return (
        <button className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`} onClick={onClick}>
            {text}
        </button>
    );
}