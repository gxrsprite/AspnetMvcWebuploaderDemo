using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebUploaderDemo.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(string uploadhidden2)
        {
            ViewBag.uploadhidden2 = uploadhidden2;
            return View();
        }

    }
}
