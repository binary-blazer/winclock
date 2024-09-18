import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render', () => {
    expect(render(<App />)).toBeTruthy();
  });

  it('should add an alarm', async () => {
    render(<App />);
    const addButton = screen.getByText('Add Alarm');
    fireEvent.click(addButton);
    const alarms = await screen.findAllByText(/Alarm/);
    expect(alarms.length).toBeGreaterThan(0);
  });

  it('should update an alarm', async () => {
    render(<App />);
    const updateButton = screen.getByText('Update Alarm');
    fireEvent.click(updateButton);
    const updatedAlarm = await screen.findByText(/Updated Alarm/);
    expect(updatedAlarm).toBeInTheDocument();
  });

  it('should delete an alarm', async () => {
    render(<App />);
    const deleteButton = screen.getByText('Delete Alarm');
    fireEvent.click(deleteButton);
    const deletedAlarm = await screen.queryByText(/Deleted Alarm/);
    expect(deletedAlarm).not.toBeInTheDocument();
  });

  it('should update the current tab', async () => {
    render(<App />);
    const tabButton = screen.getByText('Switch Tab');
    fireEvent.click(tabButton);
    const currentTab = await screen.findByText(/Current Tab/);
    expect(currentTab).toBeInTheDocument();
  });
});
