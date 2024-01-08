import type { ReactElement } from 'react';
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppRoutes from './AppRoutes';

const queryClient = new QueryClient();

export default function App(): ReactElement {
	return (
		<QueryClientProvider client={queryClient}>
        <RouterProvider router={createBrowserRouter(AppRoutes)} />
      </QueryClientProvider>
	)
}
