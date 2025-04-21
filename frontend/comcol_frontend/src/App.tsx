import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { fetchComputers, createComputer, fetchSettings } from './api'; // Removed unused imports
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import EditComputer from './EditComputer';
import Modal from 'react-modal'; // Added modal library
import { FaSortUp, FaSortDown, FaPlus, FaPen, FaList, FaTh, FaGamepad } from 'react-icons/fa'; // Added FaGamepad
import { FaHeart } from 'react-icons/fa';
import ROUTES from './routes';
import { useEditMode } from './EditModeContext';
import { Link } from 'react-router-dom';
import GamePage from './GamePage';
import MemoryGame from './MemoryGame';
import QuizzGame from './QuizzGame';
import MatchGame from './MatchGame';
import PuzzleGame from './PuzzleGame';
import ObservationGame from './ObservationGame';

interface Computer {
  id: number;
  name: string;
  maker: string;
  year?: number;
  description?: string;
  pictures: { id: number; image: string; thumb?: string; gallery?: string }[];
  favorite?: string;
}

// Set the app element for accessibility
Modal.setAppElement('#root');

// Settings context to provide description and readOnly globally
const SettingsContext = createContext<{
  description: string;
  readOnly: boolean;
} | undefined>(undefined);
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsContext.Provider');
  return ctx;
};

// Updated App.tsx to use extracted CSS classes

function Navbar({ onFavorite }: { onFavorite: () => void }) {
  const { editMode, toggleEditMode } = useEditMode();
  const { description, readOnly } = useSettings();
  if (readOnly === undefined) return null;
  console.log('[Navbar] readOnly:', readOnly, 'editMode:', editMode);

  return (
    <nav className="navbar">
      <a href={process.env.PUBLIC_URL || '/'}>
        <img src={`${process.env.PUBLIC_URL}/comcol.png`} alt="Comcol Logo" className="navbar-logo" style={{ width: '96px', height: '96px' }} />
      </a>
      <div style={{ margin: '0 auto', textAlign: 'left', fontSize: '24px', fontWeight: 'bold', lineHeight: '1.2', display: 'flex', alignItems: 'center' }}>
        {description.split('\n').map((line, i) => (
          <React.Fragment key={i}>{line}<br /></React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Link to="/game" className="navbar-button" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, backgroundColor: '#f8f9fa', color: '#000', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Games">
          <FaGamepad />
        </Link>
        <button
          onClick={onFavorite}
          className="navbar-button"
          style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, backgroundColor: '#f8f9fa', color: '#e25555', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Show my Favorite Computer"
        >
          <FaHeart />
        </button>
        {/* Only show Edit button if not readOnly */}
        {!readOnly && (
          <button
            onClick={toggleEditMode}
            className={`navbar-button ${editMode ? 'edit-mode-active' : ''}`}
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              padding: '0',
              backgroundColor: editMode ? '#007bff' : '#f8f9fa',
              color: editMode ? '#fff' : '#000',
              border: '1px solid #ddd',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto 0', // Vertically centers the button within the NavBar
            }}
          >
            <FaPen />
          </button>
        )}
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
function AppContent() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComputerName, setNewComputerName] = useState('');
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [debugRender, setDebugRender] = useState(false); // Debugging state
  const { editMode, toggleEditMode, setEditMode } = useEditMode();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<{
    description: string;
    readOnly: boolean;
  } | null>(null);

  useEffect(() => {
    fetchSettings()
      .then((result) => {
        console.log('[AppContent] fetchSettings result:', result);
        setSettings({
          description: result.description ?? "Fred's\nComputer Collection",
          readOnly: result.read_only ?? result.readOnly ?? false,
        });
      })
      .catch((e) => {
        console.error('[AppContent] fetchSettings error:', e);
        setSettings({ description: "Fred's\nComputer Collection", readOnly: false });
      });
  }, []);

  useEffect(() => {
    if (!settings) return;
    console.log('[AppContent] settings.readOnly:', settings.readOnly, 'editMode:', editMode);
    if (settings.readOnly) {
      setEditMode(false);
    }
  }, [settings, editMode, setEditMode]);

  useEffect(() => {
    if (!settings) return;
    // Load computers from the API whenever the search term changes.
    const loadComputers = async () => {
      const data = await fetchComputers(searchTerm);
      setComputers(data);
    };
    loadComputers();
  }, [settings, searchTerm]);

  useEffect(() => {
    if (!settings) return;
    if (isModalOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    }
  }, [isModalOpen, settings]);

  useEffect(() => {
    if (!settings || settings.readOnly) return;
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
  }, [settings]);

  if (!settings) {
    console.log('[AppContent] Waiting for settings...');
    return null; // or a loading spinner
  }

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
    window.location.href = '/view';
  };

  const handleButtonClick = () => {
    setIsModalOpen(true);
    setDebugRender((prev) => !prev);
  };

  // Handler for the Favorite button
  const handleFavorite = () => {
    const favorites = computers.filter(c => c.favorite && c.favorite.trim() !== '');
    if (favorites.length === 0) return;
    const random = favorites[Math.floor(Math.random() * favorites.length)];
    navigate(`/view/${random.id}?favorite=1`);
  };

  return (
    <SettingsContext.Provider value={settings}>
      <Navbar onFavorite={handleFavorite} />
      <header className="header"></header>
      <main className="main-content">
        <Routes>
          <Route
            path={ROUTES.HOME}
            element={
              editMode ? (
                <div>Edit Mode: Customize your collection here.</div>
              ) : (
                <ComputerList computers={computers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAdd={handleButtonClick} />
              )
            }
          />
          <Route path={ROUTES.EDIT_COMPUTER(':id')} element={<EditComputer />} />
          <Route path={ROUTES.GAME} element={<GamePage />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/quizz" element={<QuizzGame />} />
          <Route path="/match" element={<MatchGame />} />
          <Route path="/puzzle" element={<PuzzleGame />} />
          <Route path="/observation" element={<ObservationGame />} />
        </Routes>
      </main>
      <Footer />
      {!settings.readOnly && (
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
      )}
    </SettingsContext.Provider>
  );
}

function App() {
  return <AppContent />;
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

function TableRow({ computer, context }: { computer: Computer; context: number[] }) {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => {
        const query = context.length > 1 ? `?context=${context.join(',')}` : '';
        navigate(`/view/${computer.id}${query}`);
      }}
      className="table-row"
    >
      <td className="table-row-cell">
        {computer.pictures.length > 0 ? (
          <img
            src={computer.pictures[0].thumb || computer.pictures[0].image}
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
  const { readOnly } = useSettings();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const navigate = useNavigate();
  const location = window.location;
  // Read view mode from URL
  const params = new URLSearchParams(location.search);
  const initialGridView = params.get('view') === 'grid';
  const [isGridView, setIsGridView] = useState(initialGridView);

  // Keep view mode in sync with URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = isGridView ? 'grid' : 'list';
    if (params.get('view') !== mode) {
      params.set('view', mode);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [isGridView]);

  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

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

  const context = sortedComputers.map((computer) => computer.id);

  // Helper to add view mode to navigation
  const getViewParam = () => {
    return isGridView ? '?view=grid' : '';
  };

  if (readOnly === undefined) return null;
  console.log('[ComputerList] readOnly:', readOnly);

  return (
    <div className="computer-list">
      <div className="search-bar-container">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAdd={onAdd} />
        <button
          onClick={toggleView}
          className="toggle-view-button"
          style={{
            fontSize: '1.5em',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isGridView ? <FaList /> : <FaTh />}
        </button>
        {/* Removed the '+' Add Computer button */}
      </div>
      {isGridView ? (
        <div className="grid-view">
          {computers.map((computer) => (
            <div
              key={computer.id}
              className="grid-item"
              onClick={() => {
                const query = context.length > 1 ? `?context=${context.join(',')}` : '';
                const viewParam = getViewParam();
                const sep = query && viewParam ? '&' : '';
                navigate(`/view/${computer.id}${query || viewParam ? `${query}${sep}${viewParam.replace('?', '')}` : ''}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              {computer.pictures.length > 0 ? (
                <img
                  src={computer.pictures[0].gallery || computer.pictures[0].image}
                  alt={computer.name}
                  className="grid-image"
                />
              ) : (
                <div className="grid-placeholder">{computer.name}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <table className="computer-list-table">
          <TableHeader sortConfig={sortConfig} handleSort={handleSort} />
          <tbody>
            {sortedComputers.map((computer) => (
              <TableRow key={computer.id} computer={computer} context={context} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
