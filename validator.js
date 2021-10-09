'use strict'

// Đối tương Validator
function Validator(options) {

    // Func thực hiện việc validate
    function validate(inputElement, rule) {
        // Để có thể in ra message lỗi thì phải select đúng thẻ span (là thẻ để in ra message lỗi) của từng ô input, nhưng có nhiều thẻ span có chung class
        // Nên cách select là ô input (inputElement) chọc ra thẻ cha chứa nó, và từ thẻ cha chứa nó select ra thẻ span nằm bên trong thẻ cha đó
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);

        // value: inputElement.value
        // test function: rule.test
        // Có thể in ra để xem nó blur như thế nào cho từng ô input, nhấn vào ô nhập tên và click ra ngoài thì nó sẽ báo blur ngay fullname, tương tự làm vói ô emial sẽ báo blur ô email
        // console.log(rule)
        // console.log('blur' + rule.selector)

        // inputElement.value là input User nhập vào và truyền vào test func
        var errorMessage = rule.test(inputElement.value);
        // Có thể in ra để xem
        // console.log(errorMessage);  

        if(errorMessage) {
            // Nếu có lỗi thì innerText cho nó = message lỗi
            errorElement.innerText = errorMessage;
            // Thêm class 'invalid' đã css vào class cha để nó hiện màu đỏ (lỗi)
            inputElement.parentElement.classList.add('invalid');
        } else {
            // Ngược lại nếu ko lỗi thì gán bằng chuỗi rỗng, nếu User nhập thông tin rồi
            errorElement.innerText = '';
            // Nếu ko lỗi thì xóa class 'invalid' để cho nó hết màu đỏ
            inputElement.parentElement.classList.remove('invalid');
        }

    }


    // Phần lấy Element của form cần validate
    //Có thể console.log ra xem nó nhận đối số gì (nó trả về form-1)
    // console.log(options);
    // console.log(options.form);

    var formElement = document.querySelector(options.form);

    // Có thể in ra xem nó nhận đối số như nào
    // console.log(options.rules);

    if(formElement) {
        options.rules.forEach(function(rule) {
            // Có thể in ra xem nó lấy các selector của các rule như thế nào
            // console.log(rule.selector);

            var inputElement = formElement.querySelector(rule.selector);
      
            if(inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                // Xử lý mỗi khi User đang nhập thông tin thì nó ko hiện đỏ nữa
                inputElement.oninput = function() {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';                
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        });

    }
}





// Định nghĩa các rules
// Nguyên tắc:
// Khi có lỗi => trả ra message lỗi
// Khi ko ó lỗi => ko trả ra gì (undefined)
Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            console.log(value);
            // Nếu có value thì trả về undefined, ko có value thì trả ra messege lổi
            // .trim() để khi trường hợp User nhập toàn dấu cách, nếu ko có trim thì khi User nhập dấu cách nó cũng báo là cóa value
            return value.trim() ? undefined : 'Vui lòng nhập thông tin'
        }
    };
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            // Search 'javascript email regex' để lấy đoạn code sử dụng biểu thức chính qui kiểm tra xem có phải là email ko
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            // Nếu có nhập value và đúng cú pháp email thì trả về undefined, nếu ko đúng cú pháp hoặc ko nhập thì báo lỗi
            return regex.test(value) ? undefined : 'Chưa đúng cú pháp email';

        }
    };
}

// Rule nhập tối thiểu 
Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {      
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;

        }
    };
}