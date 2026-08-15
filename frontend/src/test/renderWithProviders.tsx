import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UndoToastProvider } from '../contexts/UndoToastContext'

export function renderWithProviders(ui: ReactElement) {
  return render(
    <MemoryRouter>
      <UndoToastProvider>{ui}</UndoToastProvider>
    </MemoryRouter>,
  )
}
