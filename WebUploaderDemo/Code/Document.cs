using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


public class Document
{
    public string Name { set; get; }
    public string Path { set; get; }
    public string Extension { set; get; }
    public int Size { set; get; }
    public string UploaderId { set; get; }
    public DateTime UploadTime { set; get; }
}
