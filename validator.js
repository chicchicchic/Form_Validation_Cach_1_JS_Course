'use strict'

// Đối tương Validator
function Validator(options) {

    // Hàm getParent để lấy ra thẻ span chứa thông báo lỗi, lúc trước ta tư duy là từ thẻ input chọc ra thẻ cha và từ thẻ cha tìm thẻ span chứa thông báo lỗi, nhưng nếu cấu trúc html nó đặt thẻ input vào các thẻ div cấp sâu hơn thì lúc này ta chọc ra thẻ cha chứa input là ko còn đúng nữa, vì ta chỉ muốn lấy ra thẻ cha chứa thẻ span
    // element ở đây là thẻ thẻ input ta muốn truyền vào, selector là thẻ span chứa thông báo lối mà ta muốn select tới
    function getParent(element, selector) {
        // Nếu tồn tại 'element.parentElement' thì mới lặp
        while(element.parentElement) {
            // Dùng 'matches' kiểm tra xem thẻ cha có class 'form-group' ko, nếu ko lặp dần dần ra các thẻ cha bên ngoài xem có class đó ko
            if(element.parentElement.matches(selector)){
                // return ra đúng thẻ cha
                return element.parentElement;
            }
            // nếu lần đầu nó lặp thẻ cha gần nhật mà ko có class ta cần select thì nó gán chính thẻ cha nó mới vừa lặp cho 'element' luôn, và lặp lần 2 thì ko còn thẻ input ban đầu nừa mà là thẻ cha vừa tìm, thế thay vì input.parentElement thì bây giờ là thẻ cha.parentElement. Nó sẽ lặp cho tới khi nó tìm ra thẻ cha chứa class ta cần tìm thì nó sẽ return ra thẻ cha mà ta cần tìm
            element = element.parentElement;

        }
    }

    var selectorRules = {};

    // Func thực hiện việc validate
    function validate(inputElement, rule) {
        // Để có thể in ra message lỗi thì phải select đúng thẻ span (là thẻ để in ra message lỗi) của từng ô input, nhưng có nhiều thẻ span có chung class
        // Nên cách select là ô input (inputElement) chọc ra thẻ cha chứa nó, và từ thẻ cha chứa nó select ra thẻ span nằm bên trong thẻ cha đó
        // Mục tiêu ta muốn ở hàm getParent() : var errorElement = getParent(inputElement, '.form-group')
        // Chúng ta ko hard code thẳng vào file JS validation form này ('.form-group' hay '.form-message') mà viết riêng ra cặp thẻ script bên file html vì sau này đoạn validate này sẽ dùng hầu hết tất cả trang web mà có những form cần validate như này, nếu hard code là chỉ dùng đúng project này 
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        // value: inputElement.value
        // test function: rule.test
        // Có thể in ra để xem nó blur như thế nào cho từng ô input, nhấn vào ô nhập tên và click ra ngoài thì nó sẽ báo blur ngay fullname, tương tự làm vói ô emial sẽ báo blur ô email
        // console.log(rule)
        // console.log('blur' + rule.selector)

        // inputElement.value là input User nhập vào và truyền vào test func
        var errorMessage;
        // Có thể in ra để xem
        // console.log(errorMessage);  


        // Nó sẽ thu lại chính những rule của chính cái field mà User click vào và blur ra ngoài
        var rules = selectorRules[rule.selector];
        // console.log(rules);


        // Lặp qua từng rule và kiểm tra, nếu có lỗi thì dừng việc kiểm tra. Ví dụ #email có 2 rule (isRequired và isEmail), nếu mà nó lặp các rule của #emial mà thấy isRequired có lỗi là dừng luôn, ko cần kiểm tra isEmail nữa
        for(var i=0; i<rules.length; ++i) {
            // Đặt switch case để khi nếu type của thẻ input là checkbox hoặc radio thì xử lý khác, còn không thì mặc định là type text ban đầu
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        // Đi từ formElement để ta lấy đúng input của form mình thôi
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            // Check nếu chỉ cần có 1 rule errorMessage thôi thì sẽ thoát khỏi vòng lặp
            if(errorMessage) break;
        }

        if(errorMessage) {
            // Nếu có lỗi thì innerText cho nó = message lỗi
            errorElement.innerText = errorMessage;
            // Thêm class 'invalid' đã css vào class cha để nó hiện màu đỏ (lỗi)
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            // Ngược lại nếu ko lỗi thì gán bằng chuỗi rỗng, nếu User nhập thông tin rồi
            errorElement.innerText = '';
            // Nếu ko lỗi thì xóa class 'invalid' để cho nó hết màu đỏ
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        // phủ định ngược lại
        return !errorMessage;

    }


    // Phần lấy Element của form cần validate
    //Có thể console.log ra xem nó nhận đối số gì (nó trả về form-1)
    // console.log(options);
    // console.log(options.form);

    var formElement = document.querySelector(options.form);

    // Có thể in ra xem nó nhận đối số như nào
    // console.log(options.rules);

    if(formElement) {
        // Khi nhấn nút submit thì ta nên bò đi hành vi mặt định của nút submit
        formElement.onsubmit = function(e) {
            // Bỏ hành vi mặt định
            e.preventDefault();

            var isFormValid = true;


            // Lặp qua từng rule và validate luôn, khi ta click submit button thì mà chưa nhập bất cứ field nào hoặc chỉ nhập 1 vài field thì nó sẽ thực hiện validate các field chưa đạt yêu cầu để nhấn submit, chứ ko phải chỉ validate khi User ko nhập hoăc nhập sai từng field 
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                // Nếu chỉ cần có 1 field ko phải là isValid thì
                if(!isValid) {
                    isFormValid = false;
                }
            });



            

            if(isFormValid) {
                // Trường hợp submit với Javascript
                if(typeof options.onSubmit === 'function') {

                    // Lấy tất cả inputs ở trang thái enable
                    // Select tất cả những thẻ có attribute là 'name' và ko có attribue là disabled
                    // Tại sao lại ko lấy những field có attribute là 'disabled' vì trong thực tế sẽ có những field ta thêm vào attribute 'disable' để User ko tương tác dc
                    // Nhưng đa phần các trường hợp là chỉ lấy attribute 'name', ko cần not([disabled])      ([name]:not([disabled]))
                    var enableInputs =  formElement.querySelectorAll('[name]');
                    // console.log(enableInputs)

                    // 'enableInputs' đang là dạng NodeList chứa tất cả thẻ input mà nó lấy dc, nên ko sử dụng dc các methhod của Array, nên ta convert nó sang Array để dùng
                    // Ta nhận vào tất cả value của ta, các inputElement
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                    // Gán input.value cho Object 'values' và return ra 'values'
                    // Vì nếu sau này ta có 1 field ko bắt buộc nhập thì ta ko nhập nó vẫn gán những giá trị của các field khác và trả về 1 Object, còn field ko bắt buộc mà nếu User ko nhập field ko bắt buộc thì nó trả về chuỗi rỗng. Ta ko viết như lúc trước là  'return (values[input.name] = input.value) && values' vì nếu viết như vậy thì nếu field ko bắt buộc mà User ko nhập vào thì nó trả về cả Object là chuỗi rỗng
                    
                    switch(input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            // Nếu nó là checkbox ko dc check thì nó sẽ gán cho values là 1 chuổi rỗng và return ra chuỗi rỗng này, nó tương tự return values dưới switch nhưng chỉ là return sớm hơn, khi if này dc return thì ko chạy tới đoạn bên dưới nữa
                            // Nhưng nếu nó dc check thì nó sẽ push value của input vào Array của mình 
                            if(!input.matches(':checked')) {
                                values[input.name] = '';
                                return values;
                            }

                            // Nếu nó ko phải là Array thì sẽ gán cho nó = Array trống
                            if(!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }

                            values[input.name].push(input.value);

                            break;

                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                    }, {});


                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }



        // Lặp qua mỗi rule và xữ lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function(rule) {

            // Lưu lại tất cả rules cho mỗi input
            if( Array.isArray(selectorRules[rule.selector])) {
                // Trong lần 2 chạy sẽ push rule tiếp theo vào đây vì trước đó (phần else) nó đã là Array rồi nên lần thứ 2 điều kiện (là Array) sẽ hợp lệ, ta chỉ cần push cái rule tiếp theo vào 
                selectorRules[rule.selector].push(rule.test);
            }else {
                // Trong lần đầu chạy nếu nó ko phải là Array thì sẽ gán cho nó bằng 1 Array có phần tữ đầu tiên là 
                selectorRules[rule.selector] = [rule.test];
            }

            // Có thể in ra xem nó lấy các selector của các rule như thế nào
            // console.log(rule.selector);


            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }
    
                // Xử lý mỗi khi User đang nhập thông tin thì nó ko hiện đỏ nữa
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';                
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
        });

        // Ra khỏi vòng for, selectorRules sẽ là 1 Object lưu lại những rule của thẻ input, in ra và sổ xuống sẽ thấy #email và #password_confirmation đã có đầy d8u3 rule của riêng từng input chứ ko còn ghi đè thành 1 rule như trước
        // console.log(selectorRules);

    }
}





// Định nghĩa các rules
// Nguyên tắc:
// Khi có lỗi => trả ra message lỗi
// Khi ko ó lỗi => ko trả ra gì (undefined)
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {

            // console.log(value);

            // Nếu có value thì trả về undefined, ko có value thì trả ra messege lổi
            // .trim() để khi trường hợp User nhập toàn dấu cách, nếu ko có trim thì khi User nhập dấu cách nó cũng báo là cóa value
            return value ? undefined : message || 'Vui lòng nhập thông tin'
        }
    };
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            // Search 'javascript email regex' để lấy đoạn code sử dụng biểu thức chính qui kiểm tra xem có phải là email ko
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            // Nếu có nhập value và đúng cú pháp email thì trả về undefined, nếu ko đúng cú pháp hoặc ko nhập thì báo lỗi
            return regex.test(value) ? undefined : message || 'Chưa đúng cú pháp email';

        }
    };
}

// Rule nhập tối thiểu 
Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {      
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;

        }
    };
}

// Rule nhập lại password
Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {      
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập lại chưa khớp'; 
        }
    };
}