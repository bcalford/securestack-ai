import type { PastedFile } from '../../types';

type PastedFileEditorProps = {
  files: PastedFile[];
  setFiles: (files: PastedFile[]) => void;
};

export default function PastedFileEditor({ files, setFiles }: PastedFileEditorProps) {
  function updateFile(index: number, patch: Partial<PastedFile>) {
    setFiles(files.map((file, currentIndex) => (currentIndex === index ? { ...file, ...patch } : file)));
  }

  return (
    <div className="pasted-file-stack" aria-label="Pasted files">
      {files.map((file, index) => {
        const fileNumber = index + 1;
        const headingId = `pasted-file-${fileNumber}-heading`;

        return (
          <section className="card pasted-file-card" key={fileNumber} aria-labelledby={headingId}>
            <h3 id={headingId}>Pasted file {fileNumber}</h3>
            <label>
              File name for pasted file {fileNumber}
              <input
                className="input"
                value={file.fileName}
                onChange={event => updateFile(index, { fileName: event.target.value })}
              />
            </label>
            <label>
              Language/type for pasted file {fileNumber}
              <input
                className="input"
                value={file.fileType}
                onChange={event => updateFile(index, { fileType: event.target.value })}
              />
            </label>
            <label>
              Paste text for pasted file {fileNumber}
              <textarea
                rows={8}
                value={file.content}
                onChange={event => updateFile(index, { content: event.target.value })}
              />
            </label>
          </section>
        );
      })}
    </div>
  );
}
