import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { SnippetPreview } from '@/types/snippet-preview';
import SnippetCard from './SnippetCard';
import { useWindowSize } from '@/hooks/useWindowSize';
import NoSnippetsMessage from './NoSnippetsMessage';

interface VirtualizedSnippetListProps {
  snippets: SnippetPreview[];
  totalSnippets: number;
  isLoading: boolean;
  isError: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  searchTerm?: string;
}

// Estimated heights for different snippet card types
const ESTIMATED_ITEM_SIZE = 300; // Base height
const ITEM_SIZE_WITH_LABELS = 350; // Height when snippet has labels

const VirtualizedSnippetList: React.FC<VirtualizedSnippetListProps> = ({
  snippets,
  totalSnippets,
  isLoading,
  isError,
  fetchNextPage,
  hasNextPage,
  searchTerm = '',
}) => {
  const navigate = useNavigate();
  const [itemSizes, setItemSizes] = useState<{[key: string]: number}>({});
  const listRef = useRef<List>(null);
  const { width, height } = useWindowSize();
  
  // When window size changes, reset cached sizes and force rerender
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [width]);

  // Handle empty states
  if (isError) {
    return <div className="p-4 text-center">Error loading snippets</div>;
  }
  
  if (!isLoading && snippets.length === 0) {
    return <NoSnippetsMessage />;
  }

  // Calculate total items including loading placeholders
  const itemCount = hasNextPage ? snippets.length + 1 : snippets.length;
  
  // Check if an item is loaded
  const isItemLoaded = (index: number) => {
    return !hasNextPage || index < snippets.length;
  };

  // Handle click on a snippet
  const handleSnippetClick = (event: React.MouseEvent, id: string) => {
    event.preventDefault();
    navigate(`/snippets/${id}`);
  };
  
  // Calculate item size based on content
  const getItemSize = (index: number) => {
    // Return cached size if available
    if (snippets[index] && itemSizes[snippets[index].id]) {
      return itemSizes[snippets[index].id];
    }
    
    // Estimate size based on content
    if (snippets[index]) {
      const snippet = snippets[index];
      const hasLabels = snippet.labels && snippet.labels.length > 0;
      return hasLabels ? ITEM_SIZE_WITH_LABELS : ESTIMATED_ITEM_SIZE;
    }
    
    // Default size for loading placeholder
    return ESTIMATED_ITEM_SIZE;
  };

  // Render an individual item
  const renderItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (!isItemLoaded(index)) {
      // Loading placeholder
      return (
        <div style={style} className="p-4">
          <div className="animate-pulse rounded bg-gray-200 h-60"></div>
        </div>
      );
    }

    // Render actual snippet
    const snippet = snippets[index];
    return (
      <div style={style} className="p-2">
        <SnippetCard
          snippet={snippet}
          searchTerm={searchTerm}
          onSnippetClick={handleSnippetClick}
        />
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={fetchNextPage}
        threshold={5} // Start loading more items when user is 5 items from the end
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={(list) => {
              // Share the ref with both react-window and react-window-infinite-loader
              listRef.current = list;
              ref(list);
            }}
            height={height - 100} // Adjust height as needed
            width="100%"
            itemCount={itemCount}
            itemSize={getItemSize}
            onItemsRendered={onItemsRendered}
            overscanCount={3} // Render 3 items above and below the visible area
          >
            {renderItem}
          </List>
        )}
      </InfiniteLoader>
    </div>
  );
};

export default VirtualizedSnippetList;