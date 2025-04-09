import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeFilters.css';

// Помощни функции за различни операции
const getSortFieldFromSortOption = (sortOption) => {
  // Премахваме минуса от началото, ако съществува
  if (!sortOption || typeof sortOption !== 'string') return '';
  return sortOption.replace(/^-/, '');
};

const getOrderFromSortOption = (sortOption) => {
  // Определяме посоката на сортиране - ако има минус, тогава е desc, иначе asc
  if (!sortOption || typeof sortOption !== 'string') return 'desc';
  return sortOption.startsWith('-') ? 'desc' : 'asc';
};

// Функция за съкращаване на етикетите за по-добра четимост
const getShortenedLabel = (label) => {
  const labels = {
    "По време за приготвяне (възходящо)": "Най-бързи първо",
    "По време за приготвяне (низходящо)": "Най-бавни първо",
  };
  return labels[label] || label;
};

const RecipeFilters = ({ 
  filters, 
  onFilterChange, 
  onSortChange, 
  onClearFilters, 
  config,
  sort = 'createdAt',
  order = 'desc'
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [currentSort, setCurrentSort] = useState(`${sort}:${order}`);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [selectedTime, setSelectedTime] = useState(0);
  const navigate = useNavigate();

  // Синхронизиране на локалния стейт с пропс
  useEffect(() => {
    setLocalFilters(filters);
    
    // Определяне на избраното време от филтрите
    if (filters.maxTime === '30' && !filters.minTime) {
      setSelectedTime(30);
    } else if (filters.minTime === '31' && filters.maxTime === '60') {
      setSelectedTime(31);
    } else if (filters.minTime === '61' && filters.maxTime === '120') {
      setSelectedTime(61);
    } else if (filters.minTime === '121') {
      setSelectedTime(121);
    } else {
      setSelectedTime(0);
    }
  }, [filters]);

  // Синхронизиране на сортирането с пропс
  useEffect(() => {
    setCurrentSort(`${sort}:${order}`);
    setCurrentOrder(order);
  }, [sort, order]);

  // Обработчици за търсене
  const handleSearchChange = (e) => {
    setLocalFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search: localFilters.search });
  };
  
  // Обработчик за филтри
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
    onFilterChange({ [name]: value });
  };

  // Обработчик за предефинирани опции за време
  const handleTimeChange = (time) => {
    let minTime = '';
    let maxTime = '';
    
    if (selectedTime === time) {
      // Ако сме кликнали на същия бутон, изчистваме филтъра
      setSelectedTime(0);
    } else {
      // Задаваме новото време
      setSelectedTime(time);
      
      if (time === 30) {
        maxTime = '30';
      } else if (time === 31) {
        minTime = '31';
        maxTime = '60';
      } else if (time === 61) {
        minTime = '61';
        maxTime = '120';        
      } else if (time == 121) {
        minTime = '121';
      }
    }
    
    // Обновяваме локалните филтри
    setLocalFilters(prev => ({ ...prev, minTime, maxTime }));
    
    // Известяваме родителя за промяната
    onFilterChange({ minTime, maxTime });
  };
  
  // Обработчик за сортиране
  const handleSortChange = (e) => {
    const rawValue = e.target.value;
    // Разделяме комбинираната стойност на поле и посока
    const [newSort, direction] = rawValue.split(':');
    
    setCurrentSort(rawValue); // Запазваме цялата стойност за правилна селекция
    
    // Директна проверка дали имаме валидна стойност
    if (!newSort) return; // Не изпращаме промени с празна стойност
    
    // Изпращаме заявка с новите стойности
    if (direction) {
      setCurrentOrder(direction);
    }
    
    onSortChange({
      sort: newSort,
      order: direction || currentOrder
    });
  };
  
  // За отваряне на страницата за създаване на рецепта
  const handleCreateClick = () => {
    navigate('/recipes/create');
  };

  const handleClearAllFilters = () => {
    const emptyFilters = {
      search: '',
      category: '',
      difficulty: '',
      minTime: '',
      maxTime: '',
      author: ''
    };
    const defaultSort = 'createdAt';
    const defaultOrder = 'desc';
    
    // 2. Обновяваме локалното състояние
    setLocalFilters(emptyFilters);
    setSelectedTime(0);
    setCurrentSort(`${defaultSort}:${defaultOrder}`);
    setCurrentOrder(defaultOrder);
    
    // Първо изчистваме филтрите
    onFilterChange(emptyFilters);
    
    // След това задаваме сортирането по подразбиране
    onSortChange({
      sort: defaultSort,
      order: defaultOrder
    });
    
    // Накрая извикваме общата функция след кратко забавяне
    setTimeout(() => {
      onClearFilters();
    }, 0);
  };

  return (
    <div className="recipe-filters">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="search"
            id="recipe-search-input"
            name="recipe-search"
            placeholder="Търси рецепти..."
            value={localFilters.search || ''}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </form>
      
      <div className="filter-section">
        <h3>Категории</h3>
        <select 
          name="category"
          value={localFilters.category || ''}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Всички категории</option>
          {config && config.localization && config.localization.categories && 
            Object.entries(config.localization.categories).map(([value, label]) => (
              <option key={value} value={value}>{label || value}</option>
            ))
          }
        </select>
      </div>
      
      <div className="filter-section">
        <h3>Сложност</h3>
        <div className="difficulty-buttons">
          {config && config.localization && config.localization.difficulties && 
            Object.entries(config.localization.difficulties).map(([value, label]) => (
              <button
                key={value}
                type="button"
                name="difficulty"
                className={`difficulty-btn ${localFilters.difficulty === value ? 'active' : ''}`}
                onClick={() => onFilterChange({ 
                  difficulty: localFilters.difficulty === value ? '' : value 
                })}
              >
                {label || value}
              </button>
            ))
          }
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Време за приготвяне</h3>
        <div className="time-buttons">
          <button
            type="button"
            className={`time-btn ${selectedTime === 30 ? 'active' : ''}`}
            onClick={() => handleTimeChange(30)}
          >
            До 30 мин
          </button>
          <button
            type="button"
            className={`time-btn ${selectedTime === 31 ? 'active' : ''}`}
            onClick={() => handleTimeChange(31)}
          >
            30 - 60 мин
          </button>
          <button
            type="button"
            className={`time-btn ${selectedTime === 61 ? 'active' : ''}`}
            onClick={() => handleTimeChange(61)}
          >
            60 - 120 мин
          </button>
          <button
            type="button"
            className={`time-btn ${selectedTime === 121 ? 'active' : ''}`}
            onClick={() => handleTimeChange(121)}
          >
            Над 120 мин
          </button>
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Сортиране</h3>
        <div className="sort-controls">
          <select 
            id="recipe-sort-select"
            name="recipe-sort"
            value={currentSort}
            onChange={handleSortChange}
            className="sort-select"
          >
            {config && config.recipe && Array.isArray(config.recipe.sortOptions) ? (
              <>
                {/* Групирани опции за време на създаване */}
                <optgroup label="Дата на създаване">
                  {config.recipe.sortOptions
                    .filter(opt => opt.sort && /^-?createdAt$/.test(opt.sort))
                    .map((option, index) => {
                      const sortField = getSortFieldFromSortOption(option.sort);
                      const direction = getOrderFromSortOption(option.sort);
                      
                      return (
                        <option 
                          key={`date-${index}`} 
                          value={`${sortField}:${direction}`} // Комбинираме поле и посока в един стринг
                          data-direction={direction}
                        >
                          {option.label}
                        </option>
                      );
                    })
                  }
                </optgroup>

                {/* Групирани опции за харесвания */}
                <optgroup label="Харесвания">
                  {config.recipe.sortOptions
                    .filter(opt => opt.sort && /^-?likes$/.test(opt.sort))
                    .map((option, index) => {
                      const sortField = getSortFieldFromSortOption(option.sort);
                      const direction = getOrderFromSortOption(option.sort);
                      
                      return (
                        <option 
                          key={`likes-${index}`} 
                          value={`${sortField}:${direction}`} // Комбинираме поле и посока в един стринг
                          data-direction={direction}
                        >
                          {option.label}
                        </option>
                      );
                    })
                  }
                </optgroup>

                {/* Групирани опции за заглавие */}
                <optgroup label="Заглавие">
                  {config.recipe.sortOptions
                    .filter(opt => opt.sort && /^-?title$/.test(opt.sort))
                    .map((option, index) => {
                      const sortField = getSortFieldFromSortOption(option.sort);
                      const direction = getOrderFromSortOption(option.sort);
                      
                      return (
                        <option 
                          key={`title-${index}`} 
                          value={`${sortField}:${direction}`} // Комбинираме поле и посока в един стринг
                          data-direction={direction}
                        >
                          {option.label}
                        </option>
                      );
                    })
                  }
                </optgroup>

                {/* Групирани опции за време на приготвяне */}
                <optgroup label="Време за приготвяне">
                  {config.recipe.sortOptions
                    .filter(opt => opt.sort && /^-?preparationTime$/.test(opt.sort))
                    .map((option, index) => {
                      const sortField = getSortFieldFromSortOption(option.sort);
                      const direction = getOrderFromSortOption(option.sort);
                      
                      return (
                        <option 
                          key={`time-${index}`} 
                          value={`${sortField}:${direction}`} // Комбинираме поле и посока в един стринг
                          data-direction={direction}
                        >
                          {getShortenedLabel(option.label)}
                        </option>
                      );
                    })
                  }
                </optgroup>
              </>
            ) : (
              <option value="createdAt">Най-нови</option>
            )}
          </select>
        </div>
      </div>
      
      <div className="filter-actions">
        <button 
          type="button"
          className="clear-filters"
          onClick={handleClearAllFilters}
        >
          Изчисти филтрите
        </button>
        
        <button 
          type="button"
          className="create-recipe-btn"
          onClick={handleCreateClick}
        >
          <i className="fas fa-plus"></i> Създай рецепта
        </button>
      </div>
    </div>
  );
};

export default RecipeFilters;