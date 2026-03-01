import { useState } from "react";

interface Props {
    placeholder?: string;
    onQuery: (query: string) => void
}

export const SearchBar = ({placeholder='Buscar',onQuery}: Props) => {
    const [search, setSearch] = useState('');
    
    const handleSearch = () => {
        onQuery(search);
    }
    
    return (
      <div className='search-container'>
        <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e)=> setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>
            Buscar
        </button>
      </div>
    )
}
