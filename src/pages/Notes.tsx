import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import {
  FolderIcon, FolderOpenIcon, FileTextIcon, SearchIcon,
  FilePlusIcon, FolderPlusIcon, ChevronRightIcon,
  PanelLeftCloseIcon, PanelLeftOpenIcon, PencilIcon, TrashIcon,
  FilePlus2Icon,
} from '../components/Icons';
import './Notes.css';

// ===== Types =====
interface NoteItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: NoteItem[];
  parentId?: string;
  content?: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  item: NoteItem | null;
}

// ===== Helpers =====
let idCounter = 100;
const genId = () => `item-${idCounter++}`;

const countNotes = (items: NoteItem[]): number => {
  let count = 0;
  for (const item of items) {
    if (item.type === 'file') count++;
    if (item.type === 'folder' && item.children) count += countNotes(item.children);
  }
  return count;
};

const filterTree = (items: NoteItem[], query: string): NoteItem[] => {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items
    .map((item) => {
      if (item.type === 'file') {
        return item.name.toLowerCase().includes(q) ? item : null;
      }
      // Folder: include if name matches or any child matches
      const filteredChildren = item.children ? filterTree(item.children, query) : [];
      if (item.name.toLowerCase().includes(q) || filteredChildren.length > 0) {
        return { ...item, children: filteredChildren };
      }
      return null;
    })
    .filter(Boolean) as NoteItem[];
};

const removeItem = (items: NoteItem[], id: string): NoteItem[] => {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.type === 'folder' && item.children) {
        return { ...item, children: removeItem(item.children, id) };
      }
      return item;
    });
};

const renameItem = (items: NoteItem[], id: string, newName: string): NoteItem[] => {
  return items.map((item) => {
    if (item.id === id) return { ...item, name: newName };
    if (item.type === 'folder' && item.children) {
      return { ...item, children: renameItem(item.children, id, newName) };
    }
    return item;
  });
};

const addChild = (items: NoteItem[], parentId: string, child: NoteItem): NoteItem[] => {
  return items.map((item) => {
    if (item.id === parentId && item.type === 'folder') {
      return { ...item, children: [...(item.children || []), child] };
    }
    if (item.type === 'folder' && item.children) {
      return { ...item, children: addChild(item.children, parentId, child) };
    }
    return item;
  });
};

// ===== Sample Data =====
const createSampleData = (): NoteItem[] => [
  {
    id: 'folder-math',
    name: 'Mathematics',
    type: 'folder',
    children: [
      { id: 'note-calc', name: 'Calculus Notes', type: 'file' },
      { id: 'note-algebra', name: 'Linear Algebra', type: 'file' },
      {
        id: 'folder-stats',
        name: 'Statistics',
        type: 'folder',
        children: [
          { id: 'note-prob', name: 'Probability Theory', type: 'file' },
          { id: 'note-dist', name: 'Distributions', type: 'file' },
        ],
      },
    ],
  },
  {
    id: 'folder-sci',
    name: 'Science',
    type: 'folder',
    children: [
      { id: 'note-phys', name: 'Physics Mechanics', type: 'file' },
      { id: 'note-chem', name: 'Organic Chemistry', type: 'file' },
      { id: 'note-bio', name: 'Cell Biology', type: 'file' },
    ],
  },
  {
    id: 'folder-cs',
    name: 'Computer Science',
    type: 'folder',
    children: [
      { id: 'note-dsa', name: 'Data Structures', type: 'file' },
      { id: 'note-algo', name: 'Algorithms', type: 'file' },
      { id: 'note-os', name: 'Operating Systems', type: 'file' },
    ],
  },
  { id: 'note-todo', name: 'Quick TODO', type: 'file' },
  { id: 'note-ideas', name: 'Ideas & Drafts', type: 'file' },
];

// ===== TreeItem Component =====
interface TreeItemProps {
  item: NoteItem;
  depth: number;
  expandedFolders: Set<string>;
  activeNoteId: string | null;
  renamingId: string | null;
  renameValue: string;
  onToggleFolder: (id: string) => void;
  onSelectNote: (item: NoteItem) => void;
  onContextMenu: (e: React.MouseEvent, item: NoteItem) => void;
  onStartRename: (id: string, currentName: string) => void;
  onRenameChange: (val: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onDelete: (id: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  depth,
  expandedFolders,
  activeNoteId,
  renamingId,
  renameValue,
  onToggleFolder,
  onSelectNote,
  onContextMenu,
  onStartRename,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onDelete,
}) => {
  const isFolder = item.type === 'folder';
  const isExpanded = expandedFolders.has(item.id);
  const isActive = activeNoteId === item.id;
  const isRenaming = renamingId === item.id;
  const noteCount = isFolder && item.children ? countNotes(item.children) : 0;
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const handleClick = () => {
    if (isFolder) {
      onToggleFolder(item.id);
    } else {
      onSelectNote(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onRenameSubmit();
    if (e.key === 'Escape') onRenameCancel();
  };

  return (
    <div className="tree-item">
      <div
        className={`tree-item-row ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, item)}
        onDoubleClick={() => onStartRename(item.id, item.name)}
      >
        {Array.from({ length: depth }).map((_, i) => (
          <span key={i} className="tree-indent" />
        ))}
        <span
          className={`tree-toggle ${isFolder && isExpanded ? 'expanded' : ''} ${!isFolder ? 'hidden' : ''}`}
        >
          {ChevronRightIcon({ size: 12, strokeWidth: 2.2 })}
        </span>
        <span className="tree-icon">{isFolder ? (isExpanded ? FolderOpenIcon({ size: 16 }) : FolderIcon({ size: 16 })) : FileTextIcon({ size: 16 })}</span>
        {isRenaming ? (
          <input
            ref={renameRef}
            className="rename-input"
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onRenameSubmit}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`tree-label ${isFolder ? 'folder-label' : ''}`}>{item.name}</span>
        )}
        {isFolder && !isRenaming && <span className="tree-count">{noteCount}</span>}
        {!isRenaming && (
          <span className="tree-item-actions">
            <button
              title="Rename"
              onClick={(e) => {
                e.stopPropagation();
                onStartRename(item.id, item.name);
              }}
            >
              {PencilIcon({ size: 12 })}
            </button>
            <button
              className="delete-btn"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              {TrashIcon({ size: 12 })}
            </button>
          </span>
        )}
      </div>
      {isFolder && isExpanded && item.children && (
        <div className="tree-children">
          {item.children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              activeNoteId={activeNoteId}
              renamingId={renamingId}
              renameValue={renameValue}
              onToggleFolder={onToggleFolder}
              onSelectNote={onSelectNote}
              onContextMenu={onContextMenu}
              onStartRename={onStartRename}
              onRenameChange={onRenameChange}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Notes Page =====
const Notes: React.FC = () => {
  const { subjectName } = useParams<{ subjectName?: string }>();

  const [notes, setNotes] = useState<NoteItem[]>(createSampleData);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // If subjectName is provided, find and expand that folder
    if (subjectName) {
      const decoded = decodeURIComponent(subjectName);
      const folder = createSampleData().find(
        (item) => item.type === 'folder' && item.name.toLowerCase() === decoded.toLowerCase()
      );
      if (folder) initial.add(folder.id);
    }
    return initial;
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteContents, setNoteContents] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  // Close context menu on click elsewhere
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  }, []);

  // Filter tree by search
  const filteredNotes = useMemo(() => filterTree(notes, search), [notes, search]);

  // Total note count
  const totalNotes = useMemo(() => countNotes(notes), [notes]);

  // ===== Handlers =====
  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectNote = useCallback((item: NoteItem) => {
    setActiveNoteId(item.id);
    // On mobile, close sidebar when selecting a note
    setMobileOpen(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, item: NoteItem) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  }, []);

  const startRename = useCallback((id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
    closeContextMenu();
  }, [closeContextMenu]);

  const submitRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      setNotes((prev) => renameItem(prev, renamingId, renameValue.trim()));
    }
    setRenamingId(null);
    setRenameValue('');
  }, [renamingId, renameValue]);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue('');
  }, []);

  const deleteItem = useCallback((id: string) => {
    setNotes((prev) => removeItem(prev, id));
    if (activeNoteId === id) setActiveNoteId(null);
    closeContextMenu();
  }, [activeNoteId, closeContextMenu]);

  const createNewNote = useCallback(() => {
    const newNote: NoteItem = {
      id: genId(),
      name: 'Untitled Note',
      type: 'file',
    };
    setNotes((prev) => [...prev, newNote]);
    setRenamingId(newNote.id);
    setRenameValue(newNote.name);
  }, []);

  const createNewFolder = useCallback(() => {
    const newFolder: NoteItem = {
      id: genId(),
      name: 'New Folder',
      type: 'folder',
      children: [],
    };
    setNotes((prev) => [...prev, newFolder]);
    setExpandedFolders((prev) => new Set(prev).add(newFolder.id));
    setRenamingId(newFolder.id);
    setRenameValue(newFolder.name);
  }, []);

  const createNoteInFolder = useCallback((folderId: string) => {
    const newNote: NoteItem = {
      id: genId(),
      name: 'Untitled Note',
      type: 'file',
      parentId: folderId,
    };
    setNotes((prev) => addChild(prev, folderId, newNote));
    setExpandedFolders((prev) => new Set(prev).add(folderId));
    setRenamingId(newNote.id);
    setRenameValue(newNote.name);
    closeContextMenu();
  }, [closeContextMenu]);

  const createFolderInFolder = useCallback((folderId: string) => {
    const newFolder: NoteItem = {
      id: genId(),
      name: 'New Folder',
      type: 'folder',
      children: [],
      parentId: folderId,
    };
    setNotes((prev) => addChild(prev, folderId, newFolder));
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.add(folderId);
      next.add(newFolder.id);
      return next;
    });
    setRenamingId(newFolder.id);
    setRenameValue(newFolder.name);
    closeContextMenu();
  }, [closeContextMenu]);

  // Expand subject folder from URL param
  useEffect(() => {
    if (subjectName) {
      const decoded = decodeURIComponent(subjectName);
      const folder = notes.find(
        (item) => item.type === 'folder' && item.name.toLowerCase() === decoded.toLowerCase()
      );
      if (folder) {
        setExpandedFolders((prev) => new Set(prev).add(folder.id));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectName]);

  // Find active note name
  const findNote = (items: NoteItem[], id: string): NoteItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findNote(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const activeNote = activeNoteId ? findNote(notes, activeNoteId) : null;

  return (
    <div className="notes-page">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`notes-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h2>vCHITR</h2>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <div className="sidebar-actions">
                <button onClick={createNewNote} title="New Note">
                  {FilePlusIcon({ size: 16 })}
                </button>
                <button onClick={createNewFolder} title="New Folder">
                  {FolderPlusIcon({ size: 16 })}
                </button>
              </div>
              <button
                className="collapse-btn"
                onClick={() => {
                  setSidebarCollapsed(true);
                  setMobileOpen(false);
                }}
                title="Collapse sidebar"
              >
                {PanelLeftCloseIcon({ size: 16 })}
              </button>
            </div>
          </div>
          <div className="sidebar-search">
            <span className="search-icon">{SearchIcon({ size: 14 })}</span>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="notes-search-input"
            />
          </div>
        </div>

        <div className="sidebar-tree">
          {filteredNotes.length === 0 ? (
            <div style={{ padding: '2rem 1.25rem', textAlign: 'center', opacity: 0.4, fontSize: '0.85rem' }}>
              {search ? 'No matching notes found' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes.map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                depth={0}
                expandedFolders={expandedFolders}
                activeNoteId={activeNoteId}
                renamingId={renamingId}
                renameValue={renameValue}
                onToggleFolder={toggleFolder}
                onSelectNote={selectNote}
                onContextMenu={handleContextMenu}
                onStartRename={startRename}
                onRenameChange={setRenameValue}
                onRenameSubmit={submitRename}
                onRenameCancel={cancelRename}
                onDelete={deleteItem}
              />
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <span>{totalNotes} note{totalNotes !== 1 ? 's' : ''}</span>
        </div>
      </aside>

      {/* Sidebar toggle when collapsed */}
      <button
        className={`sidebar-toggle-btn ${sidebarCollapsed ? 'visible' : ''}`}
        onClick={() => {
          setSidebarCollapsed(false);
          setMobileOpen(true);
        }}
        title="Open sidebar"
      >
        {PanelLeftOpenIcon({ size: 16 })}
      </button>

      {/* Content area */}
      <main className="notes-content">
        {activeNote ? (
          <MarkdownEditor
            content={noteContents[activeNote.id] || ''}
            onChange={(content) =>
              setNoteContents((prev) => ({ ...prev, [activeNote.id]: content }))
            }
            fileName={activeNote.name}
          />
        ) : (
          <>
            <div className="notes-content-header">
              <h1>{subjectName ? decodeURIComponent(subjectName) : 'Notes'}</h1>
              <div className="subtitle">
                {subjectName
                  ? `${decodeURIComponent(subjectName)} — VCHITR`
                  : 'YOUR PERSONAL NOTEBOOK'}
              </div>
            </div>
            <div className="notes-content-body">
              <div className="empty-state">
                <div className="empty-state-icon">✎</div>
                <h3>Select a note</h3>
                <p>Choose a note from the sidebar to start reading or editing. You can also create new notes and folders.</p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div className="context-menu-overlay" onClick={closeContextMenu} />
          <div
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() =>
                contextMenu.item && startRename(contextMenu.item.id, contextMenu.item.name)
              }
            >
              <span>{PencilIcon({ size: 14 })}</span> Rename
            </button>
            {contextMenu.item?.type === 'folder' && (
              <>
                <button onClick={() => contextMenu.item && createNoteInFolder(contextMenu.item.id)}>
                  <span>{FilePlus2Icon({ size: 14 })}</span> New Note Here
                </button>
                <button onClick={() => contextMenu.item && createFolderInFolder(contextMenu.item.id)}>
                  <span>{FolderPlusIcon({ size: 14 })}</span> New Folder Here
                </button>
              </>
            )}
            <div className="context-menu-divider" />
            <button
              className="danger"
              onClick={() => contextMenu.item && deleteItem(contextMenu.item.id)}
            >
              <span>{TrashIcon({ size: 14 })}</span> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Notes;
