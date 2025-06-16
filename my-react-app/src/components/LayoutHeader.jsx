import './styles/LayoutHeader.css';

export default function LayoutHeader() {
  return (
    <div className="layout-header">
      <h2>Serp API</h2>
      <div className="buttons">
        <button className="filter-btn">Filter</button>
        <button className="create-btn">Create</button>
      </div>
    </div>
  );
}
