import {test,expect} from 'vitest';import {render,screen} from '@testing-library/react';import {MemoryRouter} from 'react-router-dom';import {QueryClient,QueryClientProvider} from '@tanstack/react-query';import {Layout} from '../main';
function renderPath(path='/'){return render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={[path]}><Layout/></MemoryRouter></QueryClientProvider>)}
test('landing page renders',()=>{renderPath('/');expect(screen.getByText(/AI-assisted security reviews/)).toBeInTheDocument()});
test('new scan form renders',()=>{renderPath('/scans/new');expect(screen.getByText(/New Security Review/)).toBeInTheDocument()});
