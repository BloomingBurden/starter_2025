# Команды для работы

> Загрузить актуальную версию сборки

`git clone https://github.com/userSTANRAGE/webStarter.git`

> Проверяю файл package.json - добавляю или убираю ненужные для проекта зависимости. Затем, в этой же папке, с шифтом вызываю контекстное меню и запускаю командную строку.

`npm i`

> Запустить проект в режиме разработки:

`npm start`

> Собрать проект в папку docs:

`npm run build`

> Остальные команды смотреть в файле package.json

## Создать БЭМ файловую структуру в папке blocks:
> Пишем html с классами по БЭМ. После того, как html написан выполняем в консоли команду:

`npm run bem`

## Nunjucks инструкция
Используется шаблонизатор Nunjucks. Подробную информацию можно найти здесь:
[Nunjucks](https://mozilla.github.io/nunjucks/templating.html)

### Краткая информация:
- Все HTML-файлы хранятся в папке templates.
- Главные страницы размещаются в templates/pages
- Общая структура (head, header, footer) описана в templates/layouts.
- Компоненты и переиспользуемые секции выносятся в templates/partials.
- Переменные для шаблонов можно указывать в data.json (глобально) или рядом с компонентом (локально)

### 🧩 Использование компонентов
#### Пример: компонент breadcrumbs (хлебные крошки)
Файл: templates/partials/breadcrumbs.html
```
<ul class="{{breadcrumbsCls}} breadcrumbs list-reset">
    {% for item in list %}
        <li class="breadcrumbs__item">
            <a href="#" class="breadcrumbs__link">{{ item }}</a>
        </li>
    {% endfor %}
</ul>
```
Где `{{breadcrumbsCls}}` и `{{item}}` переменные, а `for` цикл. 

### В нужном нам месте используем компонент таким образом:
```
{% set breadcrumbsCls = "top__breadcrumbs" %}
{% set list = ["Главная", "Каталог", "Книги"] %}
{% include "./partials/breadcrumbs.html" %}
```
🔔 Важно: Объявляйте переменные непосредственно перед вставкой компонента, чтобы избежать конфликтов с другими частями шаблона.

#### Еще пример:

```
<div class="doctor {{doctor.cls}}">
    <div class="doctor__top">
        <div class="doctor__img">
            <img src="{{doctor.img}}" alt="Изображение" width="325" height="380" loading="lazy">
        </div>
        <span class="doctor__experience">{{doctor.exp}}</span>
    </div>
    <h3 class="doctor__name title title-26">{{doctor.name}}</h3>
    <p class="doctor__job">{{doctor.name}}</p>
</div>
```

```
{% set doctor = {
    "cls": "doctors__item",
    "img": "./img/doctor/1.webp",
    "exp": "Стаж 12 лет",
    "name": "Чекалова Марина Альбертовна",
    "job": "Врач ультразвуковой диагностики"
} %}
{% include "./partials/doctor.html" %}
```


### 📁 Пример структуры страницы
```
{% extends "layouts/default.html" %}

{% block content %}
   {% set breadcrumbsCls = "top__breadcrumbs" %}
   {% set list = ["Главная", "Услуги", "Дизайн"] %}
   {% include "./partials/breadcrumbs.html" %}

    {% set doctor = {
        "cls": "doctors__item",
        "img": "./img/doctor/1.webp",
        "exp": "Стаж 12 лет",
        "name": "Чекалова Марина Альбертовна",
        "job": "Врач ультразвуковой диагностики"
    } %}
   {% include "./partials/doctor.html" %}

   {% include "./partials/about.html" %}
   {% include "./partials/pagination.html" %}
{% endblock %}
```

### 📚 Дополнительно
- Используйте data.json для глобальных переменных (например, title, description, lang).

- Вы можете создать свои блоки, компоненты и layout-шаблоны для расширения структуры.

- Поддерживаются все возможности Nunjucks: if, for, macro, include, extends, import и др.



## Команды npm:
- `node -h` — показывает список всех доступных команд Node.js
- `node -v, node --version` — показывает установленную версию Node.js.
- `npm -h` — показывает список всех доступных команд пакетного менеджера npm
- `npm -v, npm --version` — показывает установленную версию npm
- `npm update npm -g` позволяет обновить версию npm
- `npm list --depth=0` показывает список установленных пакетов
- `npm outdated --depth=0` покажет список установленных пакетов, которые требуют обновления.
- `npm install $name` — позволяет установить любой пакет по его имени. Если при этом к команде добавить префикс -g пакет будет установлен глобально на весь компьютер. -S - как dependencies, -D как devDependencies. 
- `npm install $name@1.0.1` — если вы хотите установить конкретную версию пакета, воспользуйтесь префиксом @ с номером версии. Если без указания пакета, то установит все по списку из package.json (npm up больше не надо использовать)
- `npm i $name` — является укороченной альтернативой предыдущей команды
- `npm uninstall $name` — удаляет установленный пакет по имени
- `npm r $name` - удалить пакет (синоним)
- `npm list $name` — покажет версию установленного пакета
- `npm update $name` — обновить версию установленного пакета
- `npm view $name version` — покажет последнюю версию пакета, которая существует
- `npm init -y` - создать пустой, стандартный package.json
- `ncu -u --packageFile package.json` - проверить актуальность зависимостей

## Команды git:
- `git init` - инициализация git в локальной папке
- `git add` - скопировать файлы в их текущем состоянии в предкоммитный индекс
- `git status` - информация о состоянии файлов в локальном репозитории
- `git diff` - посмотреть разницу между файлами в индексе и в рабочем каталоге
- `git diff --staged` - посмотреть разницу между последним коммитом и индексом
- `git log` - вывод истории коммитов
- `git commit -m` - сохранить снимок индекса в виде коммита
- `git branch "branchname"` - создать ветку
- `git branch -d "branchname"` - удалить ветку
- `git checkout` - копирование файлов из коммита или индекса в рабочую директорию, переключение между ветками
- `git checkout -b "branchname"` - создать ветку и сразу на нее переключиться
- `git reset` - отменить индексирование
- `git merge` - слияние коммитов
- `git push -u origin master` - отправка данных на удаленный репозиторий
- `git clone https://github.com/somename/someproject.git ./` - копирование удаленного репозитория в локальный каталог

> Если git ругается на неправильный формат переносов (fatal: LF would be replaced by CRLF in), то либо привести все файлы к одной кодировке для текущей операционной системы, либо отключить настройку проверки переносов:

- `git config --global core.autocrlf false`
- `git config --global core.safecrlf false`


## Альясы для git
> В файле C:\Users\Username\\.gitconfig добавить секцию [alias] со следующим содержимым:

*	s = status --short
*	st = status
*	l = log --oneline --graph --decorate --all
*	g = log --graph --abbrev-commit --decorate --all --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(dim white) - %an%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n %C(white)%s%C(reset)'
*	br = branch
*	ch = checkout
*	cm = commit -am
*	psh = !git push --set-upstream origin $(git rev-parse --abbrev-ref HEAD)

> Это позволит вместо полной записи команд в консоли, использовать короткие альясы - git st

## Префикс-коды для работы с системой GIT для разработчиков:
* ADD - добавлен новый функционал
* UPD - обновление чего-то
* FIX - исправление ошибок
* MOV - перенос кода
* CNC - отмена
* CHG - изменение
* RFG - рефакторинг
* RNM - переименование
* DEL - удаление

# [BussinesUp](https://business-up.org/), [savchenko2277](https://github.com/savchenko2277), [BloomingBurden](https://github.com/BloomingBurden)
