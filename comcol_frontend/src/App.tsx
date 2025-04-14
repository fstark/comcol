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

// The Navbar component provides navigation and a button to add a new computer.
function Navbar({ onAdd }: { onAdd: () => void }) {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
      <a href="/">Computer List</a>
      <button onClick={onAdd} style={{ cursor: 'pointer' }}>Add Computer</button> {/* Updated button text to "Add Computer" */}
    </nav>
  );
}

// The Footer component displays a footer with copyright information.
function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd', marginTop: '20px' }}>
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
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path={ROUTES.HOME} element={<ComputerList computers={computers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />} />
          <Route path={ROUTES.EDIT_COMPUTER(':id')} element={<EditComputer />} />
        </Routes>
      </main>
      <Footer />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            width: '400px', // Set a fixed width for the modal
            margin: '20px auto', // Add margin at the top to position closer to the top
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            maxHeight: '80vh', // Ensure the modal does not extend to the bottom of the page
            overflowY: 'auto', // Add scrolling if content exceeds maxHeight
            position: 'relative', // Ensure proper positioning
          },
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Add Computer</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right' }}>Name</label>
            <input
              ref={nameInputRef} // Attach the ref to the input field
              type="text"
              placeholder="Enter computer name"
              value={newComputerName}
              onChange={(e) => setNewComputerName(e.target.value)}
              onKeyDown={handleKeyDown} // Handle keyboard events
              style={{ flex: 1, padding: '5px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={async () => {
                if (newComputerName.trim() === '') return;
                const createdComputer = await createComputer({ name: newComputerName });
                setIsModalOpen(false);
                window.location.href = `/edit/${createdComputer.id}`;
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Create
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'red',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
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
      style={{
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        border: '1px solid #ddd',
        borderRadius: '5px',
      }}
    />
  );
}

// The TableHeader component renders the table headers and handles sorting logic.
function TableHeader({ sortConfig, handleSort }: { sortConfig: { key: string; direction: 'asc' | 'desc' } | null; handleSort: (key: string) => void }) {
  return (
    <thead>
      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
        <th style={{ textAlign: 'left', padding: '10px', width: '60px' }}></th>
        {['name', 'maker', 'year', 'description'].map((key) => (
          <th
            key={key}
            style={{ textAlign: 'left', padding: '10px', cursor: 'pointer' }}
            onClick={() => handleSort(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {sortConfig?.key === key && (
              sortConfig.direction === 'asc' ? <FaSortUp style={{ marginLeft: '5px' }} /> : <FaSortDown style={{ marginLeft: '5px' }} />
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
      style={{ cursor: 'pointer', borderBottom: '1px solid #ddd', height: '70px' }}
    >
      <td style={{ padding: '10px', textAlign: 'center' }}>
        {computer.pictures.length > 0 ? (
          <img
            src={computer.pictures[0].image}
            alt={`Computer ${computer.name}`}
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
          />
        ) : (
          <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}></div>
        )}
      </td>
      <td style={{ padding: '10px' }}>{computer.name}</td>
      <td style={{ padding: '10px' }}>{computer.maker}</td>
      <td style={{ padding: '10px' }}>{computer.year}</td>
      <td style={{ padding: '10px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{computer.description}</td>
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
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Computer Collection</h1>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <TableHeader sortConfig={sortConfig} handleSort={handleSort} />
        <tbody>
          {sortedComputers.map((computer) => (
            <TableRow key={computer.id} computer={computer} />
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '10px', color: '#555' }}>
        {sortedComputers.length} {sortedComputers.length === 1 ? 'computer' : 'computers'}
      </div>
    </div>
  );
}

export default App;
