import { el, setChildren } from 'redom'; // Библиотека 'redom' для построения формы
import { number, expirationDate, cvv } from 'card-validator'; // Библиотека 'card-validator' для валидации кредитных данных
import { isEmail } from 'validator'; // Библиотека 'validator' для валидации E-mail
import Inputmask from "inputmask"; // Библиотека 'inputmask' для маскирования полей ввода

(() => {
    // Функция организации сетки внутри формы
    function getRowsForm(arrElements) {
        let arrRowsForm = [];
        for (const col of arrElements) {
            const row = el('div', col);;
            row.classList.add('row');
            arrRowsForm.push(row);
        }
        return arrRowsForm;
    }
    // Функция валидации полей формы
    function checkInputsForm(input) {
        switch (input.name) {
            case 'card': {
                if (number(input.value).isValid === false) {
                    console.log("NO CARD");
                    return false;
                }
                break;
            }
            case 'expiration': {
                if (expirationDate(input.value).isValid === false) {
                    console.log("NO EXP");
                    return false;
                }
                break;
            }
            case 'cvv': {
                if (cvv(input.value).isValid === false) {
                    console.log("NO CVV");
                    return false;
                }
                break;
            }
            case 'email': {
                if (isEmail(input.value) === false) {
                    console.log("NO EMAIL");
                    return false;
                }
                break;
            }
        }
        return true;
    }
    // Функция создания колонки внутри формы
    function getColForm(item) {
        return el('div', { class: 'col d-flex flex-column justify-content-end' }, item);
    }
    // Функция создания полей формы
    function createInputForm(name, text = '') {
        return [
            el('input', { class: 'form-control', type: 'text', id: name, name: name, required: true }),
            el('label', { class: 'form-label', for: name }, text)
        ];
    }

    // Создаём форму кредитной карты
    const form = el('form');
    form.classList.add('d-flex', 'flex-column', 'p-5', 'border', 'rounded-3', 'bg-white', 'shadow');
    form.style.gap = '20px';
    form.style.margin = '0 auto';
    form.style.maxWidth = '544px';

    // Создаём элементы формы
    let arrElements = [];
    // - Заголовок
    const headerForm = el('h2', { class: 'text-center' }, 'Онлайн-оплата');
    arrElements.push(getColForm(headerForm));
    // - Поле ввода номера карты
    const [inputCard, labelCard] = createInputForm('card', 'Номер карты');
    const inputIcon = el('div', { class: 'input-icon' }, inputCard);
    arrElements.push(getColForm([labelCard, inputIcon]));
    // - Поля ввода срока окончания и кода CVV
    const [inputExpiration, labelExpiration] = createInputForm('expiration', 'Срок действия');
    const [inputCVV, labelCVV] = createInputForm('cvv', 'CVC/CVV');
    let cols = [
        getColForm([labelExpiration, inputExpiration]),
        getColForm([labelCVV, inputCVV]),
    ];
    arrElements.push(cols);
    // - Поле ввода E-mail
    const [inputEmail, labelEmail] = createInputForm('email', 'E-mail');
    arrElements.push(getColForm([labelEmail, inputEmail]));
    // - Кнопка подтверждения оплаты
    const buttonForm = el('button', { type: 'button', disabled: 'true' }, 'Оплатить');
    buttonForm.classList.add('btn', 'btn-success', 'w-100');
    arrElements.push(getColForm(buttonForm));

    // Организовываем список полей ввода и ставим на них маски
    let arrInputsForm = [inputCard, inputExpiration, inputCVV, inputEmail];
    // - Маска для ввода номера карты
    const maskCard = new Inputmask('9999 9999 9999 9999');
    maskCard.mask(inputCard);
    // - Маска для ввода срока окончания
    const maskExpiration = new Inputmask({ alias: "datetime", inputFormat: "mm/yy" });
    maskExpiration.mask(inputExpiration);
    // - Маска для ввода кода CVV
    const maskCVV = new Inputmask('999');
    maskCVV.mask(inputCVV);
    // - Маска для ввода E-mail
    const maskEmail = new Inputmask({ alias: "email" });
    maskEmail.mask(inputEmail);

    // Регистрируем обработчик события 'input' для поля ввода номера карты
    let typePay = null; // Текущий тип платёжной системы
    inputCard.addEventListener('input', () => {
        const validCard = number(inputCard.value.replaceAll('_', ''));
        if (validCard.card) {
            if (!inputIcon.classList.contains(`input_${validCard.card.type}`)) {
                inputIcon.classList.remove(`input_${typePay}`);
                inputIcon.classList.add(`input_${validCard.card.type}`);
                typePay = validCard.card.type;
            }
            if (inputIcon.classList.contains('input_icon_close')) {
                inputIcon.classList.remove(`input_icon_close`);
            }
            if (!inputIcon.classList.contains('input_icon_show')) {
                inputIcon.classList.add('input_icon_show');
            }
        } else {
            if (inputIcon.classList.contains('input_icon_show')) {
                inputIcon.classList.remove('input_icon_show');
            }
            if (!inputIcon.classList.contains('input_icon_close')) {
                inputIcon.classList.add(`input_icon_close`);
            }
            if (typePay !== null) {
                setTimeout(() => {
                    inputIcon.classList.remove(`input_${typePay}`);
                }, 200);
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        // Задаём стили для html и body
        document.documentElement.classList.add('h-100');
        document.body.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'h-100');
        // Добавляем форму на страницу
        setChildren(form, getRowsForm(arrElements));
        setChildren(document.body, el('div', { class: 'container' }, form));
        // Регистрируем обработчик события 'blur' для каждого поля ввода
        for (const input of document.querySelectorAll('input')) {
            input.addEventListener('blur', () => {
                if (input.value !== '' && !checkInputsForm(input)) {
                    input.classList.add('border-danger', 'text-danger');
                    buttonForm.disabled = true;
                }
                else {
                    let isCheck = true;
                    for (const item of arrInputsForm) {
                        if (!checkInputsForm(item)) {
                            isCheck = false;
                            break;
                        }
                    }
                    buttonForm.disabled = !isCheck;
                }
            });
            input.addEventListener('focus', () => {
                input.classList.remove('border-danger', 'text-danger');
            });
        }
    });
})();
