$(function () {
    var remote = $('#list_shopping').attr('data-remote');
    var target = $('#list_shopping').attr('data-target');
    var items = $('#items');
    var boxload = $('#box-load');
    var cart = $('#title_keranjang');

    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        animation: false,
        customClass: {
            popup: 'animated tada'
        },
    });

    function alertSuccess(msg) {
        Toast.fire({
            type: 'success',
            title: msg
        });
    }

    function alertWarning(msg) {
        Toast.fire({
            type: 'warning',
            title: msg
        });
    }

    function alertDanger(msg) {
        Toast.fire({
            type: 'error',
            title: msg
        });
    }

    function ajaxSuccess(id) {
        $(id)[0].reset();
        $(id).find('.form-group').removeClass('has-success');
        $('[data-dismiss=modal]').click();
        $('#reset').click();
    }

    function formatAngka(angka) {
        if (typeof (angka) != 'string') angka = angka.toString();
        var reg = new RegExp('([0-9]+)([0-9]{3})');
        while (reg.test(angka)) angka = angka.replace(reg, '$1.$2');
        return angka;
    }

    $('.auto').autoNumeric('init', {
        aSep: '.',
        aDec: ',',
        vMin: '0',
        vMax: '9999999999'
    });

    $('html').bind('keypress', function (e) {
        if (e.keyCode == 13) {
            return false;
        }
    });

    scrollingElement = (document.scrollingElement || document.body)

    function scrollSmoothToBottom(id) {
        $(scrollingElement).animate({
            scrollTop: document.body.scrollHeight
        }, 1000);
    }
    
    setInterval(loadData(), 1000);

    function loadData() {
        items.empty();
        $('#msg-empty').css('display','none');
        $.ajax({
            url: http + 'fetch?f=' + remote + '&d=' + target,
            async: true,
            dataType: 'json',
            type: 'POST',
            success: function (res) {
                let datanyo = "";
                if (res.shopping.code == 1) {
                    boxload.css('display','block');
                    let max = res.shopping.data.length;
                    datanyo += "<div class=\"row itemnyo\">";
                    for (let i = 0; i < res.shopping.data.length; i++) {
                        let code = res.shopping.data[i].code;
                        let nama = res.shopping.data[i].items;
                        let price = res.shopping.data[i].price;
                        let img = http + 'assets/img/sparepart/' + res.shopping.data[i].cover;
                        let rmt = res.shopping.data[i].remote;
                        let tgt = res.shopping.data[i].target;
                        datanyo += "<div class=\"col-md-2 col-xs-6\">" +
                            "<a id=\"detail\" title=\"\" data-remote=\"" + rmt + "\" data-target=\"" + tgt + "\" data-content=\"" + code + "\">" +
                            "<div class=\"box box-solid\">" +
                            "<div class=\"box-header\">" +
                            "<h3 class=\"box-title text-ellipsis\">" + nama + "</h3>" +
                            "</div>" +
                            "<div class=\"box-body\">" +
                            "<img class=\"img-responsive\" src=\"" + img + "\" alt=\"" + nama + "\" width=\"100%\" height=\"200px\" style=\"max-height: 200px !important; height: 200px !important\">" +
                            "</div>" +
                            "<div class=\"box-footer\">" +
                            "<p>Rp. " + formatAngka(price) + "</p>" +
                            "</div>" +
                            "</div>" +
                            "</a>" +
                            "</div>";
                    }
                    datanyo+="</div>";
                    let jmlh = res.shopping.cart;
                    cart.html('Keranjang (' + jmlh + ')');
                } else {
                    $('#cari').attr('disabled',true);
                    $('#msg-empty').css('display','block');
                }
                if (res.shopping.total <= 6) {
                    $('#box-load').css('display', 'none');
                }
                items.append(datanyo);
                scrollSmoothToBottom();
            }
        });
    }

    jQuery.noConflict();

    $(document).on('click', '#detail', function (e) {
        e.preventDefault();
        $('#detail-table').empty();
        var target = $(this).attr('data-target');
        var remote = $(this).attr('data-remote');
        var id = $(this).attr('data-content');
        $.ajax({
            url: http + 'fetch?f=' + remote + '&d=' + target + '&id=' + id,
            async: true,
            dataType: 'json',
            type: 'POST',
            beforeSend: function () {
                showLoading();
            },
            success: function (res) {
                if (res.length == 0) {
                    hideLoading();
                    alertDanger('Invalid request');
                } else {
                    if (res.shopping.code == 1) {
                        hideLoading();
                        $('#detailModal').modal({
                            'show': true,
                            'backdrop': 'static'
                        });
                        let code = res.shopping.data.code;
                        let nama = res.shopping.data.items;
                        let cats = res.shopping.data.cat;
                        let price = res.shopping.data.price;
                        let desc = res.shopping.data.desc;
                        let stok = res.shopping.data.stok;
                        let unit = res.shopping.data.unit;
                        let img = http + 'assets/img/sparepart/' + res.shopping.data.cover;
                        let tr_str = '';
                        tr_str += "<tr><td colspan=\"2\"><img class=\"img-responsive\" style=\"max-height: 250px;\" width=\"100%\" src=\"" + img + "\"></td></tr>" +
                            "<tr><td style=\"width: 25% !important;\">Kode Item</td><td>" + code + "</td></tr>" +
                            "<tr><td>Nama Item</td><td>" + nama + "</td></tr>" +
                            "<tr><td>Kategori</td><td>" + cats + "</td></tr>" +
                            "<tr><td>Harga</td><td>Rp. " + formatAngka(price) + "</td></tr>" +
                            "<tr><td>Stok</td><td>" + formatAngka(stok) + " " + unit + "</td></tr>" +
                            "<tr><td>Deskripsi</td><td>" + desc + "</td></tr>";
                        $('input[name=id]').val(code);
                        $('#detail-table').append(tr_str);
                    } else {
                        hideLoading();
                        alertWarning(res.shopping.message);
                    }
                }
            }
        });
    });

    $(document).on('submit', '#add-cart', function (e) {
        e.preventDefault();
        var target = $('#add-cart').attr('data-target');
        var id = $('#add-cart').find('input[type=hidden]').val();
        $.ajax({
            url: http + 'fetch?f=' + remote + '&d=' + target + '&id=' + id,
            type: 'POST',
            async: true,
            cache: false,
            dataType: 'json',
            processData: false,
            contentType: false,
            timeout: 3000,
            beforeSend: function () {
                showLoading();
            },
            success: function (res) {
                if (res.length == 0) {
                    hideLoading();
                    alertDanger('Invalid request');
                } else {
                    if (res.shopping.code == 1) {
                        ajaxSuccess('#add-cart');
                        let jmlh = res.shopping.cart;
                        cart.html('Keranjang (' + jmlh + ')');
                        hideLoading();
                        alertSuccess(res.shopping.message);
                    } else {
                        hideLoading();
                        alertWarning(res.shopping.message);
                    }
                }
            },
            error: function (jqXHR, status, error) {
                hideLoading();
                alertDanger(status);
            }
        });
        return false;
    });

    function delay(callback, ms) {
        var timer = 0;
        return function () {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    $('#cari').keyup(delay(function (e) {
        e.preventDefault();
        var target = $('#form-cari').attr('data-target');
        var remote = $('#form-cari').attr('data-remote');
        var query = $(this).val();
        if (query != "") {
            $.ajax({
                url: http + 'fetch?f=' + remote + '&d=' + target + '&s=0&q=' + query,
                async: true,
                dataType: 'json',
                type: 'POST',
                beforeSend: function () {
                    items.empty();
                    boxload.css('display', 'none');
                    //showLoading();
                },
                success: function (res) {
                    let datanyo = "";
                    if (res.shopping.code == 1) {
                        let max = res.shopping.data.length;
                        datanyo += "<div class=\"row itemnyo\">";
                        for (let i = 0; i < res.shopping.data.length; i++) {
                            let code = res.shopping.data[i].code;
                            let nama = res.shopping.data[i].items;
                            let price = res.shopping.data[i].price;
                            let img = http + 'assets/img/sparepart/' + res.shopping.data[i].cover;
                            let rmt = res.shopping.data[i].remote;
                            let tgt = res.shopping.data[i].target;
                            datanyo += "<div class=\"col-md-2 col-xs-6\">" +
                                "<a id=\"detail\" title=\"\" data-remote=\"" + rmt + "\" data-target=\"" + tgt + "\" data-content=\"" + code + "\">" +
                                "<div class=\"box box-solid\">" +
                                "<div class=\"box-header\">" +
                                "<h3 class=\"box-title text-ellipsis\">" + nama + "</h3>" +
                                "</div>" +
                                "<div class=\"box-body\">" +
                                "<img class=\"img-responsive\" src=\"" + img + "\" alt=\"" + nama + "\" width=\"100%\" height=\"200px\" style=\"max-height: 200px !important; height: 200px !important\">" +
                                "</div>" +
                                "<div class=\"box-footer\">" +
                                "<p>Rp. " + formatAngka(price) + "</p>" +
                                "</div>" +
                                "</div>" +
                                "</a>" +
                                "</div>";
                        }
                        datanyo+="</div>";
                    } else {
                        $('#msg-empty').css('display','block');
                        $('#msg-text').html("Tidak ditemukan <em class=\"text-red\">\"" + query + "\"</em>");
                    }
                    if (res.shopping.filter <= 6) {
                        $('#box-load').css('display', 'none');
                    }
                    items.append(datanyo);
                    scrollSmoothToBottom();
                    hideLoading();
                }
            });
        } else {
            loadData();
        }
    }, 500));

    $(document).on('click', '#loadmore', function (e) {
        e.preventDefault();
        var count = 0;
        var item = $('.itemnyo').children().length;
        var remote = $('#list_shopping').attr('data-remote');
        var target = $('#box-load').attr('data-target');
        var query = $('#cari').val();
        for (let i = 0; i < item; i++) {
            count++
        }
        if (query == "") {
            $.ajax({
                url: http + 'fetch?f=' + remote + '&d=' + target + '&s=' + count + '&q=' + query,
                async: true,
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    let datanyo = "";
                    if (res.shopping.code == 1) {
                        let max = res.shopping.data.length;
                        datanyo += "<div class=\"row itemnyo\">";
                        for (let i = 0; i < res.shopping.data.length; i++) {
                            let code = res.shopping.data[i].code;
                            let nama = res.shopping.data[i].items;
                            let price = res.shopping.data[i].price;
                            let img = http + 'assets/img/sparepart/' + res.shopping.data[i].cover;
                            let rmt = res.shopping.data[i].remote;
                            let tgt = res.shopping.data[i].target;
                            datanyo += "<div class=\"col-md-2 col-xs-6\">" +
                                "<a id=\"detail\" title=\"\" data-remote=\"" + rmt + "\" data-target=\"" + tgt + "\" data-content=\"" + code + "\">" +
                                "<div class=\"box box-solid\">" +
                                "<div class=\"box-header\">" +
                                "<h3 class=\"box-title text-ellipsis\">" + nama + "</h3>" +
                                "</div>" +
                                "<div class=\"box-body\">" +
                                "<img class=\"img-responsive\" src=\"" + img + "\" alt=\"" + nama + "\" width=\"100%\" height=\"200px\" style=\"max-height: 200px !important; height: 200px !important\">" +
                                "</div>" +
                                "<div class=\"box-footer\">" +
                                "<p>Rp. " + formatAngka(price) + "</p>" +
                                "</div>" +
                                "</div>" +
                                "</a>" +
                                "</div>";
                        }
                        datanyo+="</div>";
                        items.append(datanyo);
                        count = 0;
                        let jmlh = res.shopping.cart;
                        cart.html('Keranjang (' + jmlh + ')');
                    } else {
                        $('#msg-empty').css('display','block');
                    }
                    if (res.shopping.total <= res.shopping.filter) {
                        $('#box-load').css('display', 'none');
                    }
                    scrollSmoothToBottom();
                }
            });
        } else {
            var item = $('.itemnyo').children().length;
            var target = $('#form-cari').attr('data-target');
            var remote = $('#form-cari').attr('data-remote');
            $.ajax({
                url: http + 'fetch?f=' + remote + '&d=' + target + '&s=' + item + '&q=' + query,
                async: true,
                dataType: 'json',
                type: 'POST',
                beforeSend: function() {
                    $('#box-load').css('display', 'none');
                },
                success: function (res) {
                    setTimeout(function () {
                        let datanyo = "";
                        if (res.shopping.code == 1) {
                            let max = res.shopping.data.length;
                            datanyo += "<div class=\"row itemnyo\">";
                            for (let i = 0; i < res.shopping.data.length; i++) {
                                let code = res.shopping.data[i].code;
                                let nama = res.shopping.data[i].items;
                                let price = res.shopping.data[i].price;
                                let img = http + 'assets/img/sparepart/' + res.shopping.data[i].cover;
                                let rmt = res.shopping.data[i].remote;
                                let tgt = res.shopping.data[i].target;
                                datanyo += "<div class=\"col-md-2 col-xs-6\">" +
                                    "<a id=\"detail\" title=\"\" data-remote=\"" + rmt + "\" data-target=\"" + tgt + "\" data-content=\"" + code + "\">" +
                                    "<div class=\"box box-solid\">" +
                                    "<div class=\"box-header\">" +
                                    "<h3 class=\"box-title text-ellipsis\">" + nama + "</h3>" +
                                    "</div>" +
                                    "<div class=\"box-body\">" +
                                    "<img class=\"img-responsive\" src=\"" + img + "\" alt=\"" + nama + "\" width=\"100%\" height=\"200px\" style=\"max-height: 200px !important; height: 200px !important\">" +
                                    "</div>" +
                                    "<div class=\"box-footer\">" +
                                    "<p>Rp. " + formatAngka(price) + "</p>" +
                                    "</div>" +
                                    "</div>" +
                                    "</a>" +
                                    "</div>";
                            }
                            datanyo+="</div>";
                            let jmlh = res.shopping.cart;
                            cart.html('Keranjang (' + jmlh + ')');
                        } else {
                            $('#msg-empty').css('display','block');
                            $('#msg-text').html("Tidak ditemukan <em class=\"text-red\">\"" + query + "\"</em>");
                        }
                        items.append(datanyo);
                        scrollSmoothToBottom();
                        hideLoading();
                    }, 1000);
                    if (res.shopping.filter <= 6) {
                        $('#box-load').css('display', 'none');
                    }
                }
            });
        }
    });

    $(document).on('click', '#cart', function (e) {
        e.preventDefault();
        var target = $(this).attr('data-target');
        $.ajax({
            url: http + 'fetch?f=' + remote + '&d=' + target,
            async: true,
            dataType: 'json',
            type: 'POST',
            beforeSend: function () {
                showLoading();
            },
            success: function (res) {
                if (res.length == 0) {
                    hideLoading();
                    alertDanger('Invalid request');
                } else {
                    if (res.shopping.code == 1) {
                        hideLoading();
                        let jmlh = res.shopping.cart;
                        cart.html('Keranjang (' + jmlh + ')');
                        window.location.href = res.shopping.url;
                    } else {
                        hideLoading();
                        let jmlh = res.shopping.cart;
                        cart.html('Keranjang (' + jmlh + ')');
                        alertWarning(res.shopping.message);
                    }
                }
            }
        });
    });
});