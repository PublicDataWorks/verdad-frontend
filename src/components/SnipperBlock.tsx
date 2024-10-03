import type React from 'react';
import { useNavigate } from 'react-router-dom';

interface SnippetBlockProps {
  id: string;
  preview: string;
  dateTime: string;
  radioStation: string;
  labels: { name: string; upvotes: number }[];
  commentCount: number;
  onClick: () => void;
}

const SnippetBlock: React.FC<SnippetBlockProps> = ({
  id,
  preview,
  dateTime,
  radioStation,
  labels,
  commentCount,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleSnippetClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onClick();
    navigate(`/snippet/${id}`);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 cursor-pointer" onClick={handleSnippetClick}>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-500">Snippet ID {id}</span>
      </div>
      <div className="flex">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <p className="text-sm text-gray-600 mb-2">{preview}</p>
          <p className="text-xs text-gray-500">{dateTime}, {radioStation}</p>
        </div>
        <div className="ml-4">
          {labels.slice(0, 2).map((label) => (
            <div key={label.name} className="text-sm mb-1">
              #{label.name}, {label.upvotes} upvotes
            </div>
          ))}
          <div className="text-sm mt-2">
            Comments: {commentCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetBlock;
