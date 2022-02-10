// ActiveのCSVファイルを、楽楽販売の商談管理にインポートするための、CSV加工処理
window.addEventListener('load', function() {
    
    // [ファイルを選択] FileAPIでファイルを読み込んで画面に表示
    document.getElementById('file').addEventListener('change', onFileSelect, false);
    function onFileSelect(event) {
        proc01_read(event);
    }
    
    // [コンバート] 画面に読み込んだCSVを変換して再表示
    document.getElementById('btn_convert').addEventListener('click', function() {
        proc02_conv();
    })

    // [ダウンロード] 隠し項目
    document.getElementById('lnk').addEventListener('click', function() {
        proc03_writ();
    })
    
    // [ダウンロード] 画面に再表示されたコンバート結果を、テキストファイルでダウンロード
    document.getElementById('btn_down').addEventListener('click', function() {
        document.getElementById('lnk').click();
    })
}, false);

// -----------------------------------------------------------------------
// FileAPIを利用して、CSVを画面に読み込む
function proc01_read(event) {

    var file   = event.target.files[0];
    var reader = new FileReader();
    
    reader.readAsArrayBuffer(file);
    reader.onload = function(e) {

        let codes = new Uint8Array(e.target.result);
        // SJis→Unicode にコンバート encodingライブラリを利用
        let unicodeString = Encoding.convert( codes, {to: 'unicode', from: 'sjis', type: 'string'} );

        document.getElementById('result').value = unicodeString;
    };
}

// -----------------------------------------------------------------------
// 画面に読み込んだCSVを編集して再表示
function proc02_conv(){

    var csvdata_bef = document.getElementById('result').value;  // CSVレコード（変換前）
    var csvdata_aft = "";                                       // CSVレコード（変換後）
    var tmp = csvdata_bef.split("\n");                          // CSVレコード（変換前）
    var cnt = 0;                                                // ループカウント
    var msg = "";                                               // メッセージ

    for( let i = 0; i < tmp.length; i++ ){

        let data = [];
        tmp[i] = csvSplit(tmp[i]);
        
        // 商談コード（フル）が空白であれば書き出し対象としない
        if( tmp[i][4] !== undefined ){

            data.push(tmp[i][4]);
            data.push(tmp[i][5]);
            data.push(tmp[i][6]);
            data.push(tmp[i][8]);
            data.push(tmp[i][9]);
            (tmp[i][11] == "SOFINET CLOUD(利用料") ? data.push(tmp[i][11] + ")") : data.push(tmp[i][11]);
            (tmp[i][14] == "") ? data.push("0") : data.push(tmp[i][14]);
            (tmp[i][15] == "") ? data.push("0") : data.push(tmp[i][15]);
            (tmp[i][16] == "") ? data.push("0") : data.push(tmp[i][16]);
            data.push(tmp[i][17]);
            data.push(tmp[i][18]);
            data.push(tmp[i][19]);
            data.push(tmp[i][20]);
            (i == 0) ? data.push('営業担当者コード') : data.push("");

            csvdata_aft += data.join(',') + "\n";
            cnt += 1;
        }
    }
    document.getElementById('result_cnv').value = csvdata_aft;

    msg = (Number(cnt)).toLocaleString() + " 件コンバートしました"
    document.getElementById('data_cnt').innerHTML = msg;
}

// -----------------------------------------------------------------------
// コンマを含む数値項目を配列で分割させない対応
function csvSplit(line) {

    var chr_data = "";
    var str_data = "";
    var data = [];
    var singleQuoteFlg = false;

    for ( let i = 0; i < line.length; i++ ) {

        chr_data = line.charAt(i);
        switch ( chr_data ) {
            case ',':
                if ( singleQuoteFlg ){
                    str_data += chr_data;
                }else{
                    data.push(str_data.toString());
                    str_data= "";
                }
                break;
            case '"':
                singleQuoteFlg = !singleQuoteFlg;
                str_data += chr_data;
                break;
            default:
                str_data += chr_data;
        }
    }
    data.push(str_data.toString());
    return data;
}

// -----------------------------------------------------------------------
// 画面に再表示されたコンバート結果を、テキストファイルでダウンロード
function proc03_writ() {
    
    var result = document.getElementById('result_cnv').value;
    var blob = new Blob([result], { "type" : "text/csv" });

    document.getElementById('lnk').href = window.URL.createObjectURL(blob);
}
