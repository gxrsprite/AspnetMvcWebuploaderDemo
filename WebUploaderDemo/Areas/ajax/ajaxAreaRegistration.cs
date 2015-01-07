using System.Web.Mvc;

namespace WebUploaderDemo.Areas.ajax
{
    public class ajaxAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "ajax";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "ajax_default",
                "ajax/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
