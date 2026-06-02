// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PeriodDialog } from './PeriodDialog';

describe('PeriodDialog', () => {
  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<PeriodDialog state={{ mode: 'create' }} onClose={onClose} onSave={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Add period' });

    await user.click(dialog.parentElement as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the dialog panel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<PeriodDialog state={{ mode: 'create' }} onClose={onClose} onSave={vi.fn()} />);

    await user.click(screen.getByRole('dialog', { name: 'Add period' }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<PeriodDialog state={{ mode: 'create' }} onClose={onClose} onSave={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('period-name-input')).toHaveFocus();
    });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
