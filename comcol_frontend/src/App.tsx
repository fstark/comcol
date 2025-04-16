import React, { useState, useEffect, useRef } from 'react';
import { fetchComputers, createComputer } from './api'; // Removed unused imports
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import EditComputer from './EditComputer';
import Modal from 'react-modal'; // Added modal library
import { FaSortUp, FaSortDown, FaPlus } from 'react-icons/fa'; // Import icons for sort direction and plus icon
import ROUTES from './routes';

interface Computer {
  id: number;
  name: string;
  maker: string;
  year?: number;
  description?: string;
  pictures: { id: number; image: string }[];
}

// Set the app element for accessibility
Modal.setAppElement('#root');

// Updated App.tsx to use extracted CSS classes

function Navbar() {
  return (
    <nav className="navbar">
      <a href="/">
        <img src="/comcol.png" alt="Comcol Logo" className="navbar-logo" style={{ width: '96px', height: '96px' }} />
      </a>
      <div style={{ margin: '0 auto', textAlign: 'left', fontSize: '24px', fontWeight: 'bold', lineHeight: '1.2', display: 'flex', alignItems: 'center' }}>
        Fred's<br />COMputer COLlection
      </div>
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
  const [debugRender, setDebugRender] = useState(false); // Debugging state

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
      // Ensure focus is set after the modal is fully rendered
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    }
  }, [isModalOpen]);

  useEffect(() => {
    // Add an effect to listen for the '+' key press
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '+') {
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  const handleAddComputer = () => {
    setIsModalOpen(true);
    setDebugRender((prev) => !prev); // Force re-render for debugging
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateComputer();
    } else if (event.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  const handleCreateComputer = async () => {
    if (newComputerName.trim() === '') return;
    const createdComputer = await createComputer({ name: newComputerName });
    setIsModalOpen(false);
    window.location.href = `/edit/${createdComputer.id}`;
  };

  const handleButtonClick = () => {
    console.log("HERE");
    setIsModalOpen(true);
    setDebugRender((prev) => !prev);
  };

  console.log('Modal isOpen state:', isModalOpen);

  return (
    <Router>
      <Navbar />
      <header className="header">
      </header>
      <main className="main-content">
        <Routes>
          <Route path={ROUTES.HOME} element={<ComputerList computers={computers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAdd={handleButtonClick} />} />
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
              ref={nameInputRef}
              type="text"
              placeholder="Enter computer name"
              value={newComputerName}
              onChange={(e) => setNewComputerName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="modal-form-input"
            />
          </div>
          <div className="modal-buttons">
            <button
              onClick={handleCreateComputer}
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
  onAdd: () => void; // Added onAdd prop
}

function SearchBar({ searchTerm, setSearchTerm, onAdd }: { searchTerm: string; setSearchTerm: React.Dispatch<React.SetStateAction<string>>; onAdd: () => void }) {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
    </div>
  );
}

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

function TableRow({ computer }: { computer: Computer }) {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/edit/${computer.id}`)}
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

function ComputerList({ computers, searchTerm, setSearchTerm, onAdd }: ComputerListProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Added missing state for modal

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
      <div className="search-bar-container">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAdd={() => setIsModalOpen(true)} />
        <button onClick={onAdd} className="add-computer-button">
          <FaPlus /> {/* Replace text with the plus icon */}
        </button>
      </div>
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
