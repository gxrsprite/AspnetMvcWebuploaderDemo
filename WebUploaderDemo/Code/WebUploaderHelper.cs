using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

public class WebUploaderHelper
{
    public static IEnumerable<Document> ConvertToDocuments(string jsonStr)
    {
        List<Document> documents = new List<Document>();

        if (string.IsNullOrEmpty(jsonStr))
        {
            return documents;
        }

        try
        {
            dynamic files = JsonConvert.DeserializeObject(jsonStr);
            for (int i = 0; i < files.fileList.Count; i++)
            {
                dynamic file = files.fileList[i];
                Document document = new Document();
                string path = (string)file.filePath;
                string fileName = file.name;
                document = new Document()
                {
                    Name = fileName,
                    Path = (string)file.filePath,
                    Extension = file.type,
                    Size = file.size,
                    UploaderId = HttpContext.Current.User.Identity.Name,
                    UploadTime = DateTime.Now
                };
                documents.Add(document);
            }
        }
        catch
        {
            throw new Exception("文档上传插件Uploadify格式化Json字符串失败，请检查！");
        }
        return documents;
    }


    public static void DeleteDocuments(IEnumerable<Document> documents)
    {
        foreach (Document doc in documents)
        {
            //string fullname = AppHelper.ApplicationPath + unit.Path;
            //DeleteAttachment(fullname);
        }
    }
}
