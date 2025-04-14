import React, { useState, useEffect, useRef } from 'react';
import { fetchComputers, createComputer } from './api'; // Removed unused imports
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EditComputer from './EditComputer';
import Modal from 'react-modal'; // Added modal library
import { FaSortUp, FaSortDown } from 'react-icons/fa'; // Import icons for sort direction
import ROUTES from './routes';

interface Computer {
  id: number;
  name: string;
  maker: string;
  year?: number;
  description?: string;
  pictures: { id: number; image: string }[];
}

// Updated App.tsx to use extracted CSS classes

function Navbar({ onAdd }: { onAdd: () => void }) {
  return (
    <nav className="navbar">
      <a href="/">Computer List</a>
      <button onClick={onAdd} className="navbar-button">Add Computer</button>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2025 Computer Collection</p>
    </footer>
  );
}

// The App component is the main entry point of the application, managing routes and global state.
function App() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComputerName, setNewComputerName] = useState('');
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Load computers from the API whenever the search term changes.
    const loadComputers = async () => {
      const data = await fetchComputers(searchTerm);
      setComputers(data);
    };
    loadComputers();
  }, [searchTerm]);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus(); // Ensure focus is set after the modal is fully rendered
      }, 0);
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '+') {
        setIsModalOpen(true); // Open the modal panel when '+' is pressed
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, []); // Add an effect to listen for the '+' key press

  const handleAddComputer = () => {
    setIsModalOpen(true); // Open the modal panel
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddComputer(); // Validate on pressing Enter
    } else if (event.key === 'Escape') {
      setIsModalOpen(false); // Cancel on pressing Escape
    }
  };

  return (
    <Router>
      <Navbar onAdd={handleAddComputer} />
      <main className="main-content">
        <Routes>
          <Route path={ROUTES.HOME} element={<ComputerList computers={computers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />} />
          <Route path={ROUTES.EDIT_COMPUTER(':id')} element={<EditComputer />} />
        </Routes>
      </main>
      <Footer />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal-content"
      >
        <h2 className="modal-title">Add Computer</h2>
        <div className="modal-form">
          <div className="modal-form-row">
            <label className="modal-form-label">Name</label>
            <input
              ref={nameInputRef} // Attach the ref to the input field
              type="text"
              placeholder="Enter computer name"
              value={newComputerName}
              onChange={(e) => setNewComputerName(e.target.value)}
              onKeyDown={handleKeyDown} // Handle keyboard events
              className="modal-form-input"
            />
          </div>
          <div className="modal-buttons">
            <button
              onClick={async () => {
                if (newComputerName.trim() === '') return;
                const createdComputer = await createComputer({ name: newComputerName });
                setIsModalOpen(false);
                window.location.href = `/edit/${createdComputer.id}`;
              }}
              className="modal-button-create"
            >
              Create
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="modal-button-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </Router>
  );
}

interface ComputerListProps {
  computers: Computer[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

// The SearchBar component allows users to filter the list of computers by name.
function SearchBar({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <input
      type="text"
      placeholder="Search by name..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-bar"
    />
  );
}

// The TableHeader component renders the table headers and handles sorting logic.
function TableHeader({ sortConfig, handleSort }: { sortConfig: { key: string; direction: 'asc' | 'desc' } | null; handleSort: (key: string) => void }) {
  return (
    <thead className="table-header">
      <tr>
        <th></th>
        {['name', 'maker', 'year', 'description'].map((key) => (
          <th
            key={key}
            className="table-header-cell"
            onClick={() => handleSort(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {sortConfig?.key === key && (
              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// The TableRow component renders a single row in the computer list table.
function TableRow({ computer }: { computer: Computer }) {
  return (
    <tr
      onClick={() => (window.location.href = `/edit/${computer.id}`)}
      className="table-row"
    >
      <td className="table-row-cell">
        {computer.pictures.length > 0 ? (
          <img
            src={computer.pictures[0].image}
            alt={`Computer ${computer.name}`}
            className="table-row-image"
          />
        ) : (
          <div className="table-row-placeholder"></div>
        )}
      </td>
      <td className="table-row-cell">{computer.name}</td>
      <td className="table-row-cell">{computer.maker}</td>
      <td className="table-row-cell">{computer.year}</td>
      <td className="table-row-cell">{computer.description}</td>
    </tr>
  );
}

// The ComputerList component displays a list of computers with sorting and search functionality.
function ComputerList({ computers, searchTerm, setSearchTerm }: ComputerListProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedComputers = React.useMemo(() => {
    if (!sortConfig) return computers;
    const sorted = [...computers].sort((a, b) => {
      const key = sortConfig.key as keyof Computer;
      const aValue = a[key] ?? '';
      const bValue = b[key] ?? '';
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [computers, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="computer-list">
      <h1 className="computer-list-title">Computer Collection</h1>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <table className="computer-list-table">
        <TableHeader sortConfig={sortConfig} handleSort={handleSort} />
        <tbody>
          {sortedComputers.map((computer) => (
            <TableRow key={computer.id} computer={computer} />
          ))}
        </tbody>
      </table>
      <div className="computer-list-footer">
        {sortedComputers.length} {sortedComputers.length === 1 ? 'computer' : 'computers'}
      </div>
    </div>
  );
}

export default App;
