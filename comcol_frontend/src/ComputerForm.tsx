import React from 'react';
import './ComputerForm.css';

interface ComputerFormProps {
	computer: {
		name: string;
		maker?: string;
		year?: number;
		description: string;
		url: string;
		images?: File[];
	};
	setComputer: React.Dispatch<React.SetStateAction<any>>;
	onSubmit: () => void;
	submitLabel: string;
	onDelete?: () => void;
}

const ComputerForm: React.FC<ComputerFormProps> = ({ computer, setComputer, onSubmit, submitLabel, onDelete }) => {
	return (
		<div className="form-container">
			<div className="form-content">
				<h1 className="form-title">{submitLabel === 'Save Changes' ? 'Edit Computer' : submitLabel}</h1>
				<div className="form-fields">
					<div className="form-field">
						<label className="form-label">Name</label>
						<input
							type="text"
							value={computer.name}
							onChange={(e) => setComputer({ ...computer, name: e.target.value })}
							className="form-input"
						/>
					</div>
					<div className="form-field">
						<label className="form-label">Maker</label>
						<input
							type="text"
							value={computer.maker || ''}
							onChange={(e) => setComputer({ ...computer, maker: e.target.value })}
							className="form-input"
						/>
					</div>
					<div className="form-field">
						<label className="form-label">Year</label>
						<input
							type="number"
							value={computer.year || ''}
							onChange={(e) => setComputer({ ...computer, year: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })}
							className="form-input"
						/>
					</div>
					<div className="form-field">
						<label className="form-label">Description</label>
						<textarea
							value={computer.description}
							onChange={(e) => setComputer({ ...computer, description: e.target.value })}
							className="form-input"
						/>
					</div>
					<div className="form-field">
						<label className="form-label">URL</label>
						<input
							type="url"
							value={computer.url}
							onChange={(e) => setComputer({ ...computer, url: e.target.value })}
							className="form-input"
						/>
						{computer.url && (
							<button
								onClick={() => window.open(computer.url, '_blank')}
								className="form-url-button"
								title="Open URL in new window"
							>
								🔗
							</button>
						)}
					</div>
					<div className="form-buttons">
						{onDelete && (
							<button
								onClick={onDelete}
								className="form-delete-button"
							>
								Delete Computer
							</button>
						)}
						<button
							onClick={onSubmit}
							className="form-submit-button"
						>
							{submitLabel}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ComputerForm;