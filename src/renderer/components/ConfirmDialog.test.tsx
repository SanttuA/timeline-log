// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('moves focus into the modal and traps keyboard focus until close', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <>
        <button type="button">Behind dialog</button>
        <ConfirmDialog
          state={{
            title: 'Delete entry',
            message: 'Delete this entry?',
            confirmLabel: 'Delete entry',
            onConfirm: vi.fn(),
          }}
          onClose={onClose}
          onError={vi.fn()}
        />
      </>,
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Delete entry' });

    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
