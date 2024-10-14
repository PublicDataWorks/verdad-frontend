import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// This interface should match your actual snippet data structure
interface Snippet {
  id: number;
  radio_code: string;
  name: string;
  type: string;
  channel: string;
  state: string;
  human_upvotes: number;
}

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnippets = async () => {
    setLoading(true);
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string
    );

    const { data, error } = await supabase
      .from('v0demo_sources')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching snippets:', error);
    } else {
      console.log(data)
      setSnippets(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchSnippets();
  }, []);

  const getSnippetById = (id: number) => {
    return snippets.find(snippet => snippet.id === id) || null;
  };

  return { snippets, loading, fetchSnippets };
}
