import React from 'react';

interface ComputerFormProps {
	computer: {
		name: string;
		maker?: string; // Made optional
		year?: number; // Made optional
		description: string;
		url: string;
		images?: File[];
	};
	setComputer: React.Dispatch<React.SetStateAction<any>>;
	onSubmit: () => void;
	submitLabel: string;
	onDelete?: () => void; // Fixed syntax error by adding missing arrow function syntax
}

const ComputerForm: React.FC<ComputerFormProps> = ({ computer, setComputer, onSubmit, submitLabel, onDelete }) => {
	return (
		<div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', width: '400px' }}>
				<h1 style={{ textAlign: 'center' }}>{submitLabel === 'Save Changes' ? 'Edit Computer' : submitLabel}</h1>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<label style={{ width: '100px', textAlign: 'right' }}>Name</label>
						<input
							type="text"
							value={computer.name}
							onChange={(e) => setComputer({ ...computer, name: e.target.value })}
							style={{ flex: 1, padding: '5px' }}
						/>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<label style={{ width: '100px', textAlign: 'right' }}>Maker</label>
						<input
							type="text"
							value={computer.maker || ''}
							onChange={(e) => setComputer({ ...computer, maker: e.target.value })}
							style={{ flex: 1, padding: '5px' }}
						/>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<label style={{ width: '100px', textAlign: 'right' }}>Year</label>
						<input
							type="number"
							value={computer.year || ''}
							onChange={(e) => setComputer({ ...computer, year: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })}
							style={{ flex: 1, padding: '5px' }}
						/>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<label style={{ width: '100px', textAlign: 'right' }}>Description</label>
						<textarea
							value={computer.description}
							onChange={(e) => setComputer({ ...computer, description: e.target.value })}
							style={{ flex: 1, padding: '5px' }}
						/>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<label style={{ width: '100px', textAlign: 'right' }}>URL</label>
						<input
							type="url"
							value={computer.url}
							onChange={(e) => setComputer({ ...computer, url: e.target.value })}
							style={{ flex: 1, padding: '5px' }}
						/>
						{computer.url && (
							<button
								onClick={() => window.open(computer.url, '_blank')}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									color: '#007bff',
									fontSize: '16px',
								}}
								title="Open URL in new window"
							>
								🔗
							</button>
						)}
					</div>
					<div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
						{onDelete && (
							<button
								onClick={onDelete}
								style={{
									backgroundColor: 'red',
									color: 'white',
									border: 'none',
									padding: '10px 20px',
									borderRadius: '5px',
									cursor: 'pointer',
								}}
							>
								Delete Computer
							</button>
						)}
						<button
							onClick={onSubmit}
							style={{
								padding: '10px 20px',
								backgroundColor: '#007bff',
								color: '#fff',
								border: 'none',
								borderRadius: '5px',
								cursor: 'pointer',
							}}
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