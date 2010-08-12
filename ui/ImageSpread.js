
Class('iQue.views.ImageSpread', {
  isa: iQue.UI.View
  
, has: {
    controls: { is: 'ro', requird: false, init: { } }
  , vLayout: { is: 'ro', required: false, init: [ ] }
  , hLayout: { is: 'ro', required: false, init: [ ] }
  }

, after: {
    initialize: function () {
      this.construct();
      this.listen();
      this.render();
    }
  }
  
, methods: {
    BUILD: function () {
      return { origConfig: {
        navBarHidden: false,
        title: iQue.i18n('%ptAccounts'),
        backgroundColor: LJer.design.pageColor,
        barImage: 'themes/paper/navbar.png',
        barColor: LJer.design.barColor
      } };
    }
    
  , construct: function () {
      var ct = this.controls;
      ct.btnEdit = Ti.UI.createButton ({ systemButton: Ti.UI.iPhone.SystemButton.EDIT });
      ct.btnAdd = Ti.UI.createButton ({ systemButton: Ti.UI.iPhone.SystemButton.ADD });
      ct.btnSettings = Ti.UI.createButton ({
      	title: iQue.i18n('%wSettings'),
      	style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED	
      });
      ct.btnDone = Ti.UI.createButton({
      	title: iQue.i18n('%wDone'),
      	style: Titanium.UI.iPhone.SystemButtonStyle.DONE
      });
    
      ct.tbSettings = Ti.UI.createToolbar({
        items: [ ct.btnSettings ],
      	bottom: 0,
      	borderTop: true,
      	borderBottom: false,
        barColor: LJer.design.barColor
      });

      ct.listView = new iQue.UI.TableView({
        editable: true, 
        moveable: true,
        backgroundColor: 'transparent',
        borderColor: 'none'
      }, LJ.getAccounts().invoke('getLjInfo'), LJer.layouts.accListView);
    }
    
  , render: function () {
      var ct = this.controls;
      this.tiCtrl.setLeftNavButton(ct.btnEdit);
      this.tiCtrl.setRightNavButton(ct.btnAdd);
      this.add(ct.listView);
      this.add(ct.tbSettings);
    }

  , listen: function () {
      this.controls.btnEdit.addEventListener('click', this.startEditing.bind(this));
      this.controls.btnDone.addEventListener('click', this.finishEditing.bind(this));
    }
    
  , calcLayouts: function () {
      this.vLayout = this.calcLayout();
      this.hLayout = this.calcLayout();
    }
  , calcLayout: function (layout, count) {
      var placement = [ ];
      var left = (layout.screenWidth - layout.width) / 2;
      var x = left, y = layout.topOffset;
      for (var c = 0; c < count; c++) {
      	placement.push({ x: x, y: y });
        x += layout.card.width + layout.card.hspace;
        if (x + layout.card.width >= layout.width + left) {
          x = left;
          y += layout.card.height + layout.card.vspace;
        }
      }
      return placement;    
    }
  }
});
