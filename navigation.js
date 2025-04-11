// navigation.js
document.addEventListener('DOMContentLoaded', function() {
    // Получаем все навигационные иконки
    const navIcons = document.querySelectorAll('.icon');
    
    // Определяем текущую страницу из URL
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // Добавляем обработчики событий для каждой иконки
    navIcons.forEach(icon => {
        const page = icon.getAttribute('data-page');
        
        // Подсвечиваем активную иконку
        if (page === currentPage) {
            icon.classList.add('active');
        }
        
        // Добавляем обработчик клика
        icon.addEventListener('click', function() {
            if (page) {
                // Проверяем, открыта ли уже эта страница
                if (page !== currentPage) {
                    window.location.href = page + '.html';
                }
            }
        });
    });
    
    // Загружаем контент для текущей страницы
    loadPageContent(currentPage);
});

// Функция для загрузки контента конкретной страницы
function loadPageContent(page) {
    // Здесь можно загружать контент через AJAX или показывать/скрывать блоки
    // Для простоты в текущей реализации мы будем просто переходить на нужную страницу
    
    // Обновляем ссылки на CSS и JS файлы для конкретной страницы
    const pageSpecificCss = document.getElementById('page-specific-css');
    const pageSpecificJs = document.getElementById('page-specific-js');
    
    if (pageSpecificCss) {
        pageSpecificCss.href = page + '.css';
    }
    
    if (pageSpecificJs) {
        pageSpecificJs.src = page + '.js';
    }
}