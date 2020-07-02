var xhr = new XMLHttpRequest();
xhr.open("GET", "LOFTER-Aeroblast-2020.02.29.xml", true);
xhr.onload = OnDownload;
xhr.send(null);

function OnDownload() {
    if (xhr.status != 200) { console.log("Loading Failure."); return; }
    ReadData(xhr.responseText);
    ReadQueryAndLoad();
};

const postData = new Array();

function ReadData(xmlstring) {
    const parser = new DOMParser();
    const blogData = parser.parseFromString(xmlstring, "text/xml");
    const postItems = blogData.getElementsByTagName("PostItem");

    [].forEach.call(postItems, function (postItem) {
        let post = new Object();
        post.type = TryGetValue(postItem, "type");
        post.title = TryGetValue(postItem, "title");
        post.publishTime = postItem.getElementsByTagName("publishTime")[0].innerHTML; post.publishTime = new Date(parseInt(post.publishTime));
        post.modifyTime = TryGetValue(postItem, "modifyTime"); if (post.modifyTime) post.modifyTime = new Date(parseInt(post.modifyTime));
        post.tag = TryGetValue(postItem, "tag");
        post.permalink = postItem.getElementsByTagName("permalink")[0].innerHTML;
        post.content = TryGetValue(postItem, "content");
        post.caption = TryGetValue(postItem, "caption");
        post.photoLinks = TryGetValue(postItem, "photoLinks");
        if (post.photoLinks) post.photoLinks = JSON.parse(post.photoLinks)[0];
        postData.push(post);
    });

}
function TryGetValue(postItem, name) {
    let v = postItem.getElementsByTagName(name);
    if (v.length > 0) {
        let r = v[0].innerHTML;
        if (r.startsWith("<![CDATA[")) {
            r = r.substring("<![CDATA[".length, r.length - 3);
        }
        return r;
    }
    else return "";
}

function ReplaceImage(rootElement) {
    [].forEach.call(rootElement.getElementsByTagName("img"), function (img) {
        let t = img.src.indexOf('?');
        let imgname = img.src.substring(img.src.lastIndexOf('/'), t > 0 ? t : img.src.length);
        img.src = "Images/" + imgname;
    });
}
