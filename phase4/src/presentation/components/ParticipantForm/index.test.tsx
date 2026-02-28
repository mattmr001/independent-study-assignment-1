// ABOUTME: Tests for dynamic participant form
// ABOUTME: Verifies field rendering from protocol schema and coded ID assignment

import { render, fireEvent } from '@testing-library/react-native';
import { ParticipantForm } from './index';

const mockSchema = [
  { name: 'age', label: 'Age', type: 'number' as const, required: true },
  { name: 'race', label: 'Race', type: 'select' as const, options: ['White', 'Black'], required: true },
];

describe('ParticipantForm', () => {
  it('renders fields from protocol schema', () => {
    const { getByText } = render(
      <ParticipantForm schema={mockSchema} codedId="P001" onSubmit={jest.fn()} />
    );
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('Race')).toBeTruthy();
  });

  it('displays the assigned coded ID', () => {
    const { getByText } = render(
      <ParticipantForm schema={mockSchema} codedId="P003" onSubmit={jest.fn()} />
    );
    expect(getByText('P003')).toBeTruthy();
  });

  it('calls onSubmit with form data', () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <ParticipantForm schema={mockSchema} codedId="P001" onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText('Age'), '65');
    fireEvent.press(getByText('Save'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ age: '65' }),
    );
  });
});
