
namespace('iQ.ui');

iQ.include('lib/iqcl/ui/Component.js');
iQ.include('lib/iqcl/ui/BasicControls.js');
iQ.include('lib/iqcl/ui/FormControls.js');

iQ.include('lib/iqcl/ui/Dialogs.js');

iQ.include('lib/iqcl/ui/View.js');
iQ.include('lib/iqcl/ui/BasicViews.js');
iQ.include('lib/iqcl/ui/BarViews.js');
iQ.include('lib/iqcl/ui/Maps.js');
iQ.include('lib/iqcl/ui/Tables.js');

iQ.include('lib/iqcl/ui/Window.js');
iQ.include('lib/iqcl/ui/Tabs.js');
iQ.include('lib/iqcl/ui/Navigation.js');

if(iQ.iPad()) {
  iQ.include('lib/iqcl/ui/Split.js');
}
