// ABOUTME: Storybook stories for CapturePreview
// ABOUTME: Shows image preview component with placeholder

import type { Meta, StoryObj } from '@storybook/react-native';
import { CapturePreview } from './index';

const meta: Meta<typeof CapturePreview> = {
  title: 'CapturePreview',
  component: CapturePreview,
};

export default meta;

type Story = StoryObj<typeof CapturePreview>;

export const Default: Story = {
  args: {
    imagePath: 'https://picsum.photos/400/300',
  },
};
