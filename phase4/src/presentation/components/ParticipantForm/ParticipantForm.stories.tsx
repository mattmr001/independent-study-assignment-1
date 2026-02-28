// ABOUTME: Storybook stories for ParticipantForm
// ABOUTME: Shows form states with Go Wish demographics schema

import type { Meta, StoryObj } from '@storybook/react-native';
import { ParticipantForm } from './index';
import { GO_WISH_PROTOCOL } from '../../../go-wish/protocol';

const meta: Meta<typeof ParticipantForm> = {
  title: 'ParticipantForm',
  component: ParticipantForm,
};

export default meta;

type Story = StoryObj<typeof ParticipantForm>;

export const Default: Story = {
  args: {
    schema: GO_WISH_PROTOCOL.participantSchema,
    codedId: 'P001',
    onSubmit: (data) => console.log('Submitted:', data),
  },
};

export const ThirdParticipant: Story = {
  args: {
    schema: GO_WISH_PROTOCOL.participantSchema,
    codedId: 'P003',
    onSubmit: (data) => console.log('Submitted:', data),
  },
};

export const MinimalSchema: Story = {
  args: {
    schema: [
      { name: 'age', label: 'Age', type: 'number', required: true },
      { name: 'notes', label: 'Notes', type: 'text', required: false },
    ],
    codedId: 'P001',
    onSubmit: (data) => console.log('Submitted:', data),
  },
};
