/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
$(document).ready(function() {

    $(".click-title").mouseenter( function(    e){
        e.preventDefault();
        this.style.cursor="pointer";
    });
    $(".click-title").mousedown( function(event){
        event.preventDefault();
    });

    // Ugly code while this script is shared among several pages
    try{
        refreshHitsPerSecond(true);
    } catch(e){}
    try{
        refreshResponseTimeOverTime(true);
    } catch(e){}
    try{
        refreshResponseTimePercentiles();
    } catch(e){}
});


var responseTimePercentilesInfos = {
        data: {"result": {"minY": 463.0, "minX": 0.0, "maxY": 2030.0, "series": [{"data": [[0.0, 463.0], [0.1, 476.0], [0.2, 485.0], [0.3, 490.0], [0.4, 494.0], [0.5, 496.0], [0.6, 497.0], [0.7, 499.0], [0.8, 502.0], [0.9, 505.0], [1.0, 506.0], [1.1, 509.0], [1.2, 510.0], [1.3, 511.0], [1.4, 512.0], [1.5, 513.0], [1.6, 515.0], [1.7, 516.0], [1.8, 517.0], [1.9, 518.0], [2.0, 519.0], [2.1, 521.0], [2.2, 522.0], [2.3, 523.0], [2.4, 525.0], [2.5, 526.0], [2.6, 528.0], [2.7, 529.0], [2.8, 530.0], [2.9, 531.0], [3.0, 532.0], [3.1, 533.0], [3.2, 534.0], [3.3, 536.0], [3.4, 536.0], [3.5, 537.0], [3.6, 538.0], [3.7, 539.0], [3.8, 540.0], [3.9, 542.0], [4.0, 543.0], [4.1, 544.0], [4.2, 544.0], [4.3, 546.0], [4.4, 547.0], [4.5, 548.0], [4.6, 549.0], [4.7, 551.0], [4.8, 552.0], [4.9, 553.0], [5.0, 553.0], [5.1, 554.0], [5.2, 555.0], [5.3, 556.0], [5.4, 557.0], [5.5, 558.0], [5.6, 559.0], [5.7, 560.0], [5.8, 561.0], [5.9, 562.0], [6.0, 563.0], [6.1, 564.0], [6.2, 565.0], [6.3, 566.0], [6.4, 568.0], [6.5, 569.0], [6.6, 569.0], [6.7, 571.0], [6.8, 573.0], [6.9, 575.0], [7.0, 576.0], [7.1, 577.0], [7.2, 578.0], [7.3, 579.0], [7.4, 580.0], [7.5, 580.0], [7.6, 583.0], [7.7, 584.0], [7.8, 585.0], [7.9, 586.0], [8.0, 588.0], [8.1, 589.0], [8.2, 590.0], [8.3, 591.0], [8.4, 592.0], [8.5, 593.0], [8.6, 595.0], [8.7, 596.0], [8.8, 596.0], [8.9, 598.0], [9.0, 598.0], [9.1, 599.0], [9.2, 600.0], [9.3, 602.0], [9.4, 603.0], [9.5, 604.0], [9.6, 605.0], [9.7, 607.0], [9.8, 609.0], [9.9, 611.0], [10.0, 612.0], [10.1, 613.0], [10.2, 614.0], [10.3, 616.0], [10.4, 618.0], [10.5, 618.0], [10.6, 620.0], [10.7, 620.0], [10.8, 623.0], [10.9, 624.0], [11.0, 624.0], [11.1, 626.0], [11.2, 628.0], [11.3, 629.0], [11.4, 631.0], [11.5, 632.0], [11.6, 634.0], [11.7, 635.0], [11.8, 636.0], [11.9, 637.0], [12.0, 638.0], [12.1, 640.0], [12.2, 641.0], [12.3, 642.0], [12.4, 643.0], [12.5, 643.0], [12.6, 645.0], [12.7, 645.0], [12.8, 647.0], [12.9, 649.0], [13.0, 650.0], [13.1, 650.0], [13.2, 651.0], [13.3, 651.0], [13.4, 653.0], [13.5, 654.0], [13.6, 656.0], [13.7, 657.0], [13.8, 658.0], [13.9, 660.0], [14.0, 661.0], [14.1, 661.0], [14.2, 662.0], [14.3, 664.0], [14.4, 665.0], [14.5, 666.0], [14.6, 667.0], [14.7, 668.0], [14.8, 669.0], [14.9, 669.0], [15.0, 670.0], [15.1, 671.0], [15.2, 672.0], [15.3, 673.0], [15.4, 674.0], [15.5, 675.0], [15.6, 676.0], [15.7, 678.0], [15.8, 679.0], [15.9, 680.0], [16.0, 681.0], [16.1, 682.0], [16.2, 683.0], [16.3, 684.0], [16.4, 685.0], [16.5, 687.0], [16.6, 687.0], [16.7, 688.0], [16.8, 688.0], [16.9, 689.0], [17.0, 691.0], [17.1, 691.0], [17.2, 691.0], [17.3, 693.0], [17.4, 694.0], [17.5, 695.0], [17.6, 695.0], [17.7, 696.0], [17.8, 696.0], [17.9, 697.0], [18.0, 699.0], [18.1, 699.0], [18.2, 700.0], [18.3, 702.0], [18.4, 702.0], [18.5, 704.0], [18.6, 705.0], [18.7, 705.0], [18.8, 707.0], [18.9, 708.0], [19.0, 709.0], [19.1, 710.0], [19.2, 711.0], [19.3, 711.0], [19.4, 712.0], [19.5, 712.0], [19.6, 713.0], [19.7, 714.0], [19.8, 715.0], [19.9, 716.0], [20.0, 716.0], [20.1, 717.0], [20.2, 718.0], [20.3, 718.0], [20.4, 719.0], [20.5, 720.0], [20.6, 721.0], [20.7, 721.0], [20.8, 722.0], [20.9, 722.0], [21.0, 723.0], [21.1, 724.0], [21.2, 724.0], [21.3, 725.0], [21.4, 726.0], [21.5, 727.0], [21.6, 728.0], [21.7, 728.0], [21.8, 729.0], [21.9, 731.0], [22.0, 732.0], [22.1, 732.0], [22.2, 734.0], [22.3, 734.0], [22.4, 735.0], [22.5, 736.0], [22.6, 737.0], [22.7, 738.0], [22.8, 739.0], [22.9, 739.0], [23.0, 740.0], [23.1, 741.0], [23.2, 742.0], [23.3, 742.0], [23.4, 743.0], [23.5, 743.0], [23.6, 744.0], [23.7, 745.0], [23.8, 745.0], [23.9, 746.0], [24.0, 747.0], [24.1, 748.0], [24.2, 749.0], [24.3, 750.0], [24.4, 750.0], [24.5, 751.0], [24.6, 752.0], [24.7, 753.0], [24.8, 753.0], [24.9, 755.0], [25.0, 755.0], [25.1, 756.0], [25.2, 756.0], [25.3, 757.0], [25.4, 758.0], [25.5, 759.0], [25.6, 759.0], [25.7, 760.0], [25.8, 761.0], [25.9, 762.0], [26.0, 763.0], [26.1, 763.0], [26.2, 764.0], [26.3, 765.0], [26.4, 765.0], [26.5, 766.0], [26.6, 767.0], [26.7, 768.0], [26.8, 769.0], [26.9, 770.0], [27.0, 770.0], [27.1, 771.0], [27.2, 772.0], [27.3, 773.0], [27.4, 773.0], [27.5, 774.0], [27.6, 775.0], [27.7, 775.0], [27.8, 775.0], [27.9, 776.0], [28.0, 776.0], [28.1, 777.0], [28.2, 777.0], [28.3, 778.0], [28.4, 779.0], [28.5, 780.0], [28.6, 781.0], [28.7, 782.0], [28.8, 783.0], [28.9, 783.0], [29.0, 784.0], [29.1, 785.0], [29.2, 786.0], [29.3, 787.0], [29.4, 787.0], [29.5, 788.0], [29.6, 789.0], [29.7, 789.0], [29.8, 790.0], [29.9, 791.0], [30.0, 792.0], [30.1, 793.0], [30.2, 793.0], [30.3, 794.0], [30.4, 794.0], [30.5, 796.0], [30.6, 796.0], [30.7, 797.0], [30.8, 798.0], [30.9, 798.0], [31.0, 798.0], [31.1, 800.0], [31.2, 800.0], [31.3, 801.0], [31.4, 801.0], [31.5, 803.0], [31.6, 803.0], [31.7, 804.0], [31.8, 805.0], [31.9, 805.0], [32.0, 806.0], [32.1, 806.0], [32.2, 807.0], [32.3, 808.0], [32.4, 809.0], [32.5, 809.0], [32.6, 810.0], [32.7, 810.0], [32.8, 811.0], [32.9, 812.0], [33.0, 812.0], [33.1, 813.0], [33.2, 813.0], [33.3, 814.0], [33.4, 814.0], [33.5, 815.0], [33.6, 816.0], [33.7, 816.0], [33.8, 817.0], [33.9, 817.0], [34.0, 819.0], [34.1, 819.0], [34.2, 819.0], [34.3, 820.0], [34.4, 821.0], [34.5, 822.0], [34.6, 822.0], [34.7, 823.0], [34.8, 824.0], [34.9, 824.0], [35.0, 825.0], [35.1, 825.0], [35.2, 826.0], [35.3, 826.0], [35.4, 827.0], [35.5, 828.0], [35.6, 828.0], [35.7, 829.0], [35.8, 830.0], [35.9, 830.0], [36.0, 831.0], [36.1, 831.0], [36.2, 831.0], [36.3, 832.0], [36.4, 832.0], [36.5, 833.0], [36.6, 834.0], [36.7, 834.0], [36.8, 834.0], [36.9, 835.0], [37.0, 836.0], [37.1, 836.0], [37.2, 837.0], [37.3, 838.0], [37.4, 838.0], [37.5, 839.0], [37.6, 840.0], [37.7, 840.0], [37.8, 841.0], [37.9, 841.0], [38.0, 842.0], [38.1, 842.0], [38.2, 842.0], [38.3, 843.0], [38.4, 844.0], [38.5, 844.0], [38.6, 845.0], [38.7, 845.0], [38.8, 846.0], [38.9, 846.0], [39.0, 847.0], [39.1, 847.0], [39.2, 848.0], [39.3, 848.0], [39.4, 849.0], [39.5, 849.0], [39.6, 849.0], [39.7, 850.0], [39.8, 851.0], [39.9, 851.0], [40.0, 852.0], [40.1, 853.0], [40.2, 854.0], [40.3, 854.0], [40.4, 854.0], [40.5, 855.0], [40.6, 855.0], [40.7, 856.0], [40.8, 856.0], [40.9, 857.0], [41.0, 857.0], [41.1, 858.0], [41.2, 859.0], [41.3, 859.0], [41.4, 859.0], [41.5, 860.0], [41.6, 860.0], [41.7, 861.0], [41.8, 862.0], [41.9, 862.0], [42.0, 862.0], [42.1, 863.0], [42.2, 863.0], [42.3, 864.0], [42.4, 864.0], [42.5, 865.0], [42.6, 866.0], [42.7, 866.0], [42.8, 867.0], [42.9, 867.0], [43.0, 867.0], [43.1, 868.0], [43.2, 868.0], [43.3, 869.0], [43.4, 869.0], [43.5, 869.0], [43.6, 870.0], [43.7, 870.0], [43.8, 871.0], [43.9, 871.0], [44.0, 871.0], [44.1, 872.0], [44.2, 872.0], [44.3, 873.0], [44.4, 873.0], [44.5, 874.0], [44.6, 874.0], [44.7, 875.0], [44.8, 875.0], [44.9, 876.0], [45.0, 877.0], [45.1, 878.0], [45.2, 878.0], [45.3, 879.0], [45.4, 879.0], [45.5, 879.0], [45.6, 879.0], [45.7, 880.0], [45.8, 880.0], [45.9, 880.0], [46.0, 881.0], [46.1, 881.0], [46.2, 881.0], [46.3, 882.0], [46.4, 882.0], [46.5, 882.0], [46.6, 883.0], [46.7, 883.0], [46.8, 883.0], [46.9, 884.0], [47.0, 884.0], [47.1, 885.0], [47.2, 885.0], [47.3, 885.0], [47.4, 886.0], [47.5, 886.0], [47.6, 887.0], [47.7, 887.0], [47.8, 888.0], [47.9, 888.0], [48.0, 889.0], [48.1, 889.0], [48.2, 890.0], [48.3, 890.0], [48.4, 890.0], [48.5, 890.0], [48.6, 891.0], [48.7, 891.0], [48.8, 892.0], [48.9, 892.0], [49.0, 892.0], [49.1, 892.0], [49.2, 893.0], [49.3, 893.0], [49.4, 894.0], [49.5, 894.0], [49.6, 895.0], [49.7, 895.0], [49.8, 895.0], [49.9, 896.0], [50.0, 896.0], [50.1, 897.0], [50.2, 897.0], [50.3, 897.0], [50.4, 898.0], [50.5, 898.0], [50.6, 898.0], [50.7, 899.0], [50.8, 899.0], [50.9, 900.0], [51.0, 900.0], [51.1, 900.0], [51.2, 901.0], [51.3, 902.0], [51.4, 902.0], [51.5, 903.0], [51.6, 903.0], [51.7, 904.0], [51.8, 904.0], [51.9, 904.0], [52.0, 905.0], [52.1, 905.0], [52.2, 905.0], [52.3, 906.0], [52.4, 906.0], [52.5, 906.0], [52.6, 907.0], [52.7, 907.0], [52.8, 907.0], [52.9, 908.0], [53.0, 908.0], [53.1, 909.0], [53.2, 909.0], [53.3, 909.0], [53.4, 910.0], [53.5, 910.0], [53.6, 910.0], [53.7, 911.0], [53.8, 911.0], [53.9, 911.0], [54.0, 912.0], [54.1, 912.0], [54.2, 913.0], [54.3, 913.0], [54.4, 913.0], [54.5, 914.0], [54.6, 914.0], [54.7, 915.0], [54.8, 915.0], [54.9, 915.0], [55.0, 916.0], [55.1, 916.0], [55.2, 916.0], [55.3, 917.0], [55.4, 917.0], [55.5, 917.0], [55.6, 917.0], [55.7, 918.0], [55.8, 918.0], [55.9, 919.0], [56.0, 920.0], [56.1, 920.0], [56.2, 920.0], [56.3, 920.0], [56.4, 921.0], [56.5, 921.0], [56.6, 921.0], [56.7, 922.0], [56.8, 922.0], [56.9, 922.0], [57.0, 923.0], [57.1, 923.0], [57.2, 924.0], [57.3, 924.0], [57.4, 925.0], [57.5, 925.0], [57.6, 926.0], [57.7, 926.0], [57.8, 926.0], [57.9, 926.0], [58.0, 927.0], [58.1, 927.0], [58.2, 927.0], [58.3, 928.0], [58.4, 928.0], [58.5, 928.0], [58.6, 929.0], [58.7, 929.0], [58.8, 929.0], [58.9, 930.0], [59.0, 930.0], [59.1, 930.0], [59.2, 931.0], [59.3, 931.0], [59.4, 931.0], [59.5, 931.0], [59.6, 932.0], [59.7, 932.0], [59.8, 932.0], [59.9, 933.0], [60.0, 933.0], [60.1, 933.0], [60.2, 934.0], [60.3, 934.0], [60.4, 934.0], [60.5, 934.0], [60.6, 935.0], [60.7, 935.0], [60.8, 935.0], [60.9, 936.0], [61.0, 936.0], [61.1, 936.0], [61.2, 937.0], [61.3, 937.0], [61.4, 937.0], [61.5, 937.0], [61.6, 938.0], [61.7, 938.0], [61.8, 938.0], [61.9, 939.0], [62.0, 939.0], [62.1, 940.0], [62.2, 940.0], [62.3, 940.0], [62.4, 941.0], [62.5, 941.0], [62.6, 941.0], [62.7, 942.0], [62.8, 942.0], [62.9, 942.0], [63.0, 943.0], [63.1, 943.0], [63.2, 943.0], [63.3, 943.0], [63.4, 943.0], [63.5, 944.0], [63.6, 944.0], [63.7, 945.0], [63.8, 946.0], [63.9, 946.0], [64.0, 946.0], [64.1, 946.0], [64.2, 946.0], [64.3, 947.0], [64.4, 947.0], [64.5, 948.0], [64.6, 948.0], [64.7, 948.0], [64.8, 948.0], [64.9, 949.0], [65.0, 949.0], [65.1, 949.0], [65.2, 950.0], [65.3, 950.0], [65.4, 950.0], [65.5, 950.0], [65.6, 950.0], [65.7, 951.0], [65.8, 951.0], [65.9, 951.0], [66.0, 952.0], [66.1, 952.0], [66.2, 952.0], [66.3, 952.0], [66.4, 953.0], [66.5, 953.0], [66.6, 953.0], [66.7, 953.0], [66.8, 953.0], [66.9, 954.0], [67.0, 954.0], [67.1, 955.0], [67.2, 955.0], [67.3, 955.0], [67.4, 955.0], [67.5, 956.0], [67.6, 956.0], [67.7, 956.0], [67.8, 956.0], [67.9, 957.0], [68.0, 957.0], [68.1, 957.0], [68.2, 958.0], [68.3, 958.0], [68.4, 958.0], [68.5, 958.0], [68.6, 959.0], [68.7, 959.0], [68.8, 959.0], [68.9, 959.0], [69.0, 960.0], [69.1, 960.0], [69.2, 960.0], [69.3, 961.0], [69.4, 961.0], [69.5, 961.0], [69.6, 962.0], [69.7, 962.0], [69.8, 962.0], [69.9, 963.0], [70.0, 963.0], [70.1, 963.0], [70.2, 964.0], [70.3, 964.0], [70.4, 964.0], [70.5, 965.0], [70.6, 965.0], [70.7, 965.0], [70.8, 965.0], [70.9, 965.0], [71.0, 966.0], [71.1, 966.0], [71.2, 966.0], [71.3, 967.0], [71.4, 967.0], [71.5, 968.0], [71.6, 968.0], [71.7, 968.0], [71.8, 969.0], [71.9, 969.0], [72.0, 969.0], [72.1, 969.0], [72.2, 970.0], [72.3, 970.0], [72.4, 970.0], [72.5, 971.0], [72.6, 971.0], [72.7, 971.0], [72.8, 972.0], [72.9, 972.0], [73.0, 973.0], [73.1, 973.0], [73.2, 973.0], [73.3, 974.0], [73.4, 974.0], [73.5, 974.0], [73.6, 975.0], [73.7, 975.0], [73.8, 975.0], [73.9, 976.0], [74.0, 976.0], [74.1, 977.0], [74.2, 977.0], [74.3, 977.0], [74.4, 977.0], [74.5, 978.0], [74.6, 978.0], [74.7, 978.0], [74.8, 979.0], [74.9, 979.0], [75.0, 979.0], [75.1, 980.0], [75.2, 980.0], [75.3, 981.0], [75.4, 981.0], [75.5, 981.0], [75.6, 982.0], [75.7, 982.0], [75.8, 982.0], [75.9, 983.0], [76.0, 984.0], [76.1, 984.0], [76.2, 984.0], [76.3, 984.0], [76.4, 985.0], [76.5, 985.0], [76.6, 985.0], [76.7, 986.0], [76.8, 986.0], [76.9, 987.0], [77.0, 987.0], [77.1, 987.0], [77.2, 987.0], [77.3, 988.0], [77.4, 988.0], [77.5, 988.0], [77.6, 989.0], [77.7, 989.0], [77.8, 989.0], [77.9, 990.0], [78.0, 990.0], [78.1, 990.0], [78.2, 990.0], [78.3, 991.0], [78.4, 991.0], [78.5, 992.0], [78.6, 992.0], [78.7, 993.0], [78.8, 993.0], [78.9, 993.0], [79.0, 994.0], [79.1, 994.0], [79.2, 995.0], [79.3, 995.0], [79.4, 995.0], [79.5, 996.0], [79.6, 997.0], [79.7, 997.0], [79.8, 998.0], [79.9, 998.0], [80.0, 999.0], [80.1, 999.0], [80.2, 1000.0], [80.3, 1000.0], [80.4, 1000.0], [80.5, 1000.0], [80.6, 1001.0], [80.7, 1001.0], [80.8, 1001.0], [80.9, 1002.0], [81.0, 1002.0], [81.1, 1002.0], [81.2, 1002.0], [81.3, 1003.0], [81.4, 1003.0], [81.5, 1003.0], [81.6, 1004.0], [81.7, 1004.0], [81.8, 1004.0], [81.9, 1005.0], [82.0, 1005.0], [82.1, 1006.0], [82.2, 1006.0], [82.3, 1006.0], [82.4, 1007.0], [82.5, 1007.0], [82.6, 1008.0], [82.7, 1008.0], [82.8, 1008.0], [82.9, 1009.0], [83.0, 1009.0], [83.1, 1010.0], [83.2, 1010.0], [83.3, 1010.0], [83.4, 1011.0], [83.5, 1012.0], [83.6, 1012.0], [83.7, 1012.0], [83.8, 1013.0], [83.9, 1013.0], [84.0, 1013.0], [84.1, 1014.0], [84.2, 1014.0], [84.3, 1015.0], [84.4, 1015.0], [84.5, 1015.0], [84.6, 1016.0], [84.7, 1017.0], [84.8, 1017.0], [84.9, 1017.0], [85.0, 1019.0], [85.1, 1019.0], [85.2, 1020.0], [85.3, 1020.0], [85.4, 1021.0], [85.5, 1021.0], [85.6, 1022.0], [85.7, 1023.0], [85.8, 1023.0], [85.9, 1024.0], [86.0, 1025.0], [86.1, 1025.0], [86.2, 1026.0], [86.3, 1026.0], [86.4, 1027.0], [86.5, 1027.0], [86.6, 1028.0], [86.7, 1028.0], [86.8, 1029.0], [86.9, 1029.0], [87.0, 1030.0], [87.1, 1030.0], [87.2, 1031.0], [87.3, 1032.0], [87.4, 1032.0], [87.5, 1034.0], [87.6, 1034.0], [87.7, 1035.0], [87.8, 1035.0], [87.9, 1035.0], [88.0, 1036.0], [88.1, 1037.0], [88.2, 1037.0], [88.3, 1038.0], [88.4, 1038.0], [88.5, 1039.0], [88.6, 1039.0], [88.7, 1040.0], [88.8, 1040.0], [88.9, 1040.0], [89.0, 1041.0], [89.1, 1042.0], [89.2, 1042.0], [89.3, 1043.0], [89.4, 1044.0], [89.5, 1044.0], [89.6, 1045.0], [89.7, 1046.0], [89.8, 1047.0], [89.9, 1048.0], [90.0, 1048.0], [90.1, 1049.0], [90.2, 1049.0], [90.3, 1050.0], [90.4, 1050.0], [90.5, 1051.0], [90.6, 1051.0], [90.7, 1052.0], [90.8, 1052.0], [90.9, 1053.0], [91.0, 1053.0], [91.1, 1055.0], [91.2, 1056.0], [91.3, 1056.0], [91.4, 1056.0], [91.5, 1058.0], [91.6, 1058.0], [91.7, 1059.0], [91.8, 1061.0], [91.9, 1061.0], [92.0, 1062.0], [92.1, 1063.0], [92.2, 1064.0], [92.3, 1065.0], [92.4, 1066.0], [92.5, 1067.0], [92.6, 1069.0], [92.7, 1069.0], [92.8, 1070.0], [92.9, 1071.0], [93.0, 1072.0], [93.1, 1075.0], [93.2, 1076.0], [93.3, 1078.0], [93.4, 1079.0], [93.5, 1080.0], [93.6, 1081.0], [93.7, 1082.0], [93.8, 1084.0], [93.9, 1085.0], [94.0, 1086.0], [94.1, 1087.0], [94.2, 1088.0], [94.3, 1089.0], [94.4, 1091.0], [94.5, 1092.0], [94.6, 1093.0], [94.7, 1094.0], [94.8, 1095.0], [94.9, 1097.0], [95.0, 1098.0], [95.1, 1099.0], [95.2, 1102.0], [95.3, 1103.0], [95.4, 1105.0], [95.5, 1106.0], [95.6, 1108.0], [95.7, 1111.0], [95.8, 1113.0], [95.9, 1114.0], [96.0, 1115.0], [96.1, 1117.0], [96.2, 1119.0], [96.3, 1122.0], [96.4, 1124.0], [96.5, 1125.0], [96.6, 1127.0], [96.7, 1129.0], [96.8, 1132.0], [96.9, 1135.0], [97.0, 1136.0], [97.1, 1138.0], [97.2, 1140.0], [97.3, 1143.0], [97.4, 1145.0], [97.5, 1148.0], [97.6, 1149.0], [97.7, 1152.0], [97.8, 1156.0], [97.9, 1159.0], [98.0, 1162.0], [98.1, 1170.0], [98.2, 1177.0], [98.3, 1185.0], [98.4, 1196.0], [98.5, 1210.0], [98.6, 1218.0], [98.7, 1229.0], [98.8, 1237.0], [98.9, 1252.0], [99.0, 1255.0], [99.1, 1275.0], [99.2, 1286.0], [99.3, 1320.0], [99.4, 1349.0], [99.5, 1375.0], [99.6, 1441.0], [99.7, 1533.0], [99.8, 1691.0], [99.9, 1753.0], [100.0, 2030.0]], "isOverall": false, "label": "POST /api/auth/login", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
        getOptions: function() {
            return {
                series: {
                    points: { show: false }
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentiles'
                },
                xaxis: {
                    tickDecimals: 1,
                    axisLabel: "Percentiles",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Percentile value in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : %x.2 percentile was %y ms"
                },
                selection: { mode: "xy" },
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentiles"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesPercentiles"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesPercentiles"), dataset, prepareOverviewOptions(options));
        }
};

/**
 * @param elementId Id of element where we display message
 */
function setEmptyGraph(elementId) {
    $(function() {
        $(elementId).text("No graph series with filter="+seriesFilter);
    });
}

// Response times percentiles
function refreshResponseTimePercentiles() {
    var infos = responseTimePercentilesInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimePercentiles");
        return;
    }
    if (isGraph($("#flotResponseTimesPercentiles"))){
        infos.createGraph();
    } else {
        var choiceContainer = $("#choicesResponseTimePercentiles");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesPercentiles", "#overviewResponseTimesPercentiles");
        $('#bodyResponseTimePercentiles .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimeDistributionInfos = {
        data: {"result": {"minY": 1.0, "minX": 400.0, "maxY": 1952.0, "series": [{"data": [[600.0, 596.0], [700.0, 864.0], [800.0, 1319.0], [900.0, 1952.0], [1000.0, 995.0], [1100.0, 223.0], [1200.0, 50.0], [1300.0, 21.0], [1400.0, 10.0], [1500.0, 5.0], [1600.0, 4.0], [400.0, 48.0], [1700.0, 9.0], [1800.0, 2.0], [1900.0, 1.0], [500.0, 563.0], [2000.0, 1.0]], "isOverall": false, "label": "POST /api/auth/login", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 2000.0, "title": "Response Time Distribution"}},
        getOptions: function() {
            var granularity = this.data.result.granularity;
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    barWidth: this.data.result.granularity
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " responses for " + label + " were between " + xval + " and " + (xval + granularity) + " ms";
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimeDistribution"), prepareData(data.result.series, $("#choicesResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshResponseTimeDistribution() {
    var infos = responseTimeDistributionInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeDistribution");
        return;
    }
    if (isGraph($("#flotResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var syntheticResponseTimeDistributionInfos = {
        data: {"result": {"minY": 22.0, "minX": 0.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 6591.0, "series": [{"data": [[0.0, 50.0]], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [[1.0, 6591.0]], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 22.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 2.0, "title": "Synthetic Response Times Distribution"}},
        getOptions: function() {
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendSyntheticResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times ranges",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                    tickLength:0,
                    min:-0.5,
                    max:3.5
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    align: "center",
                    barWidth: 0.25,
                    fill:.75
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " " + label;
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            options.xaxis.ticks = data.result.ticks;
            $.plot($("#flotSyntheticResponseTimeDistribution"), prepareData(data.result.series, $("#choicesSyntheticResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshSyntheticResponseTimeDistribution() {
    var infos = syntheticResponseTimeDistributionInfos;
    prepareSeries(infos.data, true);
    if (isGraph($("#flotSyntheticResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerSyntheticResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var activeThreadsOverTimeInfos = {
        data: {"result": {"minY": 18.72093023255814, "minX": 1.77063186E12, "maxY": 49.61609122584731, "series": [{"data": [[1.77063186E12, 18.72093023255814], [1.77063198E12, 49.61609122584731], [1.77063192E12, 49.24912280701755]], "isOverall": false, "label": "Login Users", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.77063198E12, "title": "Active Threads Over Time"}},
        getOptions: function() {
            return {
                series: {
                    stack: true,
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 6,
                    show: true,
                    container: '#legendActiveThreadsOverTime'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                selection: {
                    mode: 'xy'
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : At %x there were %y active threads"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesActiveThreadsOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotActiveThreadsOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewActiveThreadsOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Active Threads Over Time
function refreshActiveThreadsOverTime(fixTimestamps) {
    var infos = activeThreadsOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotActiveThreadsOverTime"))) {
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesActiveThreadsOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotActiveThreadsOverTime", "#overviewActiveThreadsOverTime");
        $('#footerActiveThreadsOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var timeVsThreadsInfos = {
        data: {"result": {"minY": 511.6666666666667, "minX": 1.0, "maxY": 1301.0, "series": [{"data": [[32.0, 679.3636363636364], [33.0, 706.6666666666666], [2.0, 881.0], [34.0, 713.5999999999999], [35.0, 730.6666666666666], [36.0, 602.4], [37.0, 663.3333333333334], [38.0, 734.4444444444445], [39.0, 1036.7777777777778], [40.0, 806.8571428571429], [41.0, 798.0666666666665], [42.0, 874.7777777777779], [43.0, 779.9090909090908], [44.0, 628.9166666666667], [45.0, 756.125], [46.0, 817.9], [47.0, 898.2857142857143], [48.0, 955.875], [49.0, 991.5], [3.0, 908.0], [50.0, 874.427080037963], [4.0, 913.0], [5.0, 923.0], [8.0, 906.0], [9.0, 1301.0], [10.0, 1088.6], [11.0, 1250.75], [12.0, 748.5], [13.0, 751.5], [14.0, 591.25], [15.0, 668.7499999999999], [16.0, 586.2], [1.0, 888.0], [17.0, 605.8], [18.0, 511.6666666666667], [19.0, 830.1428571428571], [20.0, 572.7142857142857], [21.0, 669.25], [22.0, 642.6], [23.0, 626.875], [24.0, 584.8333333333334], [25.0, 634.5833333333334], [26.0, 638.125], [27.0, 564.1111111111111], [28.0, 693.0], [29.0, 648.0], [30.0, 719.7], [31.0, 787.6000000000001]], "isOverall": false, "label": "POST /api/auth/login", "isController": false}, {"data": [[49.02896593126223, 867.7997898844379]], "isOverall": false, "label": "POST /api/auth/login-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 50.0, "title": "Time VS Threads"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: { noColumns: 2,show: true, container: '#legendTimeVsThreads' },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: At %x.2 active threads, Average response time was %y.2 ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesTimeVsThreads"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotTimesVsThreads"), dataset, options);
            // setup overview
            $.plot($("#overviewTimesVsThreads"), dataset, prepareOverviewOptions(options));
        }
};

// Time vs threads
function refreshTimeVsThreads(){
    var infos = timeVsThreadsInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTimeVsThreads");
        return;
    }
    if(isGraph($("#flotTimesVsThreads"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTimeVsThreads");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTimesVsThreads", "#overviewTimesVsThreads");
        $('#footerTimeVsThreads .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var bytesThroughputOverTimeInfos = {
        data : {"result": {"minY": 356.9, "minX": 1.77063186E12, "maxY": 55176.0, "series": [{"data": [[1.77063186E12, 1387.4666666666667], [1.77063198E12, 50932.933333333334], [1.77063192E12, 55176.0]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.77063186E12, 356.9], [1.77063198E12, 13101.55], [1.77063192E12, 14193.0]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.77063198E12, "title": "Bytes Throughput Over Time"}},
        getOptions : function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity) ,
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Bytes / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendBytesThroughputOverTime'
                },
                selection: {
                    mode: "xy"
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y"
                }
            };
        },
        createGraph : function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesBytesThroughputOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotBytesThroughputOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewBytesThroughputOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Bytes throughput Over Time
function refreshBytesThroughputOverTime(fixTimestamps) {
    var infos = bytesThroughputOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotBytesThroughputOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesBytesThroughputOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotBytesThroughputOverTime", "#overviewBytesThroughputOverTime");
        $('#footerBytesThroughputOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimesOverTimeInfos = {
        data: {"result": {"minY": 661.406976744186, "minX": 1.77063186E12, "maxY": 885.0703199239769, "series": [{"data": [[1.77063186E12, 661.406976744186], [1.77063198E12, 885.0703199239769], [1.77063192E12, 857.047368421052]], "isOverall": false, "label": "POST /api/auth/login", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.77063198E12, "title": "Response Time Over Time"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average response time was %y ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Times Over Time
function refreshResponseTimeOverTime(fixTimestamps) {
    var infos = responseTimesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotResponseTimesOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesOverTime", "#overviewResponseTimesOverTime");
        $('#footerResponseTimesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var latenciesOverTimeInfos = {
        data: {"result": {"minY": 661.3604651162789, "minX": 1.77063186E12, "maxY": 885.0430788723478, "series": [{"data": [[1.77063186E12, 661.3604651162789], [1.77063198E12, 885.0430788723478], [1.77063192E12, 857.0339181286532]], "isOverall": false, "label": "POST /api/auth/login", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.77063198E12, "title": "Latencies Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response latencies in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendLatenciesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average latency was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesLatenciesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotLatenciesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewLatenciesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Latencies Over Time
function refreshLatenciesOverTime(fixTimestamps) {
    var infos = latenciesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyLatenciesOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotLatenciesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesLatenciesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotLatenciesOverTime", "#overviewLatenciesOverTime");
        $('#footerLatenciesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var connectTimeOverTimeInfos = {
        data: {"result": {"minY": 0.006335128286347812, "minX": 1.77063186E12, "maxY": 0.26744186046511653, "series": [{"data": [[1.77063186E12, 0.26744186046511653], [1.77063198E12, 0.006335128286347812], [1.77063192E12, 0.0076023391812865704]], "isOverall": false, "label": "POST /api/auth/login", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.77063198E12, "title": "Connect Time Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getConnectTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average Connect Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendConnectTimeOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average connect time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesConnectTimeOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotConnectTimeOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewConnectTimeOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Connect Time Over Time
function refreshConnectTimeOverTime(fixTimestamps) {
    var infos = connectTimeOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyConnectTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotConnectTimeOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesConnectTimeOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotConnectTimeOverTime", "#overviewConnectTimeOverTime");
        $('#footerConnectTimeOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var responseTimePercentilesOverTimeInfos = {
        data: {"result": {"minY": 463.0, "minX": 1.77063186E12, "maxY": 2030.0, "series": [{"data": [[1.77063186E12, 1794.0], [1.77063198E12, 1494.0], [1.77063192E12, 2030.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.77063186E12, 463.0], [1.77063198E12, 468.0], [1.77063192E12, 477.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.77063186E12, 1081.6], [1.77063198E12, 1050.0], [1.77063192E12, 1042.0]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.77063186E12, 1794.0], [1.77063198E12, 1149.42], [1.77063192E12, 1338.7399999999998]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.77063186E12, 515.5], [1.77063198E12, 927.0], [1.77063192E12, 867.0]], "isOverall": false, "label": "Median", "isController": false}, {"data": [[1.77063186E12, 1421.4499999999964], [1.77063198E12, 1083.0], [1.77063192E12, 1122.0]], "isOverall": false, "label": "95th percentile", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.77063198E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Response Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentilesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Response time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentilesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimePercentilesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimePercentilesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Time Percentiles Over Time
function refreshResponseTimePercentilesOverTime(fixTimestamps) {
    var infos = responseTimePercentilesOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotResponseTimePercentilesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimePercentilesOverTime", "#overviewResponseTimePercentilesOverTime");
        $('#footerResponseTimePercentilesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var responseTimeVsRequestInfos = {
    data: {"result": {"minY": 506.0, "minX": 3.0, "maxY": 1620.0, "series": [{"data": [[36.0, 761.0], [38.0, 599.0], [39.0, 871.0], [40.0, 966.5], [46.0, 768.0], [3.0, 1620.0], [48.0, 911.5], [50.0, 958.0], [51.0, 938.5], [53.0, 913.0], [52.0, 975.0], [55.0, 915.0], [54.0, 884.5], [57.0, 931.0], [56.0, 885.0], [58.0, 893.0], [59.0, 906.0], [61.0, 871.0], [60.0, 886.0], [63.0, 920.0], [62.0, 881.5], [67.0, 746.0], [64.0, 801.5], [65.0, 783.0], [68.0, 752.5], [69.0, 750.0], [71.0, 975.0], [74.0, 800.5], [72.0, 919.0], [76.0, 818.0], [18.0, 552.5], [27.0, 506.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 76.0, "title": "Response Time Vs Request"}},
    getOptions: function() {
        return {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Response Time in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: {
                noColumns: 2,
                show: true,
                container: '#legendResponseTimeVsRequest'
            },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median response time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesResponseTimeVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotResponseTimeVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewResponseTimeVsRequest"), dataset, prepareOverviewOptions(options));

    }
};

// Response Time vs Request
function refreshResponseTimeVsRequest() {
    var infos = responseTimeVsRequestInfos;
    prepareSeries(infos.data);
    if (isGraph($("#flotResponseTimeVsRequest"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeVsRequest");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimeVsRequest", "#overviewResponseTimeVsRequest");
        $('#footerResponseRimeVsRequest .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var latenciesVsRequestInfos = {
    data: {"result": {"minY": 506.0, "minX": 3.0, "maxY": 1620.0, "series": [{"data": [[36.0, 761.0], [38.0, 599.0], [39.0, 871.0], [40.0, 966.5], [46.0, 768.0], [3.0, 1620.0], [48.0, 911.5], [50.0, 958.0], [51.0, 938.5], [53.0, 913.0], [52.0, 975.0], [55.0, 915.0], [54.0, 884.5], [57.0, 931.0], [56.0, 885.0], [58.0, 893.0], [59.0, 906.0], [61.0, 871.0], [60.0, 886.0], [63.0, 920.0], [62.0, 881.5], [67.0, 746.0], [64.0, 801.5], [65.0, 783.0], [68.0, 752.5], [69.0, 750.0], [71.0, 975.0], [74.0, 800.5], [72.0, 919.0], [76.0, 818.0], [18.0, 552.5], [27.0, 506.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 76.0, "title": "Latencies Vs Request"}},
    getOptions: function() {
        return{
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Latency in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: { noColumns: 2,show: true, container: '#legendLatencyVsRequest' },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median Latency time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesLatencyVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotLatenciesVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewLatenciesVsRequest"), dataset, prepareOverviewOptions(options));
    }
};

// Latencies vs Request
function refreshLatenciesVsRequest() {
        var infos = latenciesVsRequestInfos;
        prepareSeries(infos.data);
        if(isGraph($("#flotLatenciesVsRequest"))){
            infos.createGraph();
        }else{
            var choiceContainer = $("#choicesLatencyVsRequest");
            createLegend(choiceContainer, infos);
            infos.createGraph();
            setGraphZoomable("#flotLatenciesVsRequest", "#overviewLatenciesVsRequest");
            $('#footerLatenciesVsRequest .legendColorBox > div').each(function(i){
                $(this).clone().prependTo(choiceContainer.find("li").eq(i));
            });
        }
};

var hitsPerSecondInfos = {
        data: {"result": {"minY": 1.85, "minX": 1.77063186E12, "maxY": 57.416666666666664, "series": [{"data": [[1.77063186E12, 1.85], [1.77063198E12, 51.78333333333333], [1.77063192E12, 57.416666666666664]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.77063198E12, "title": "Hits Per Second"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of hits / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendHitsPerSecond"
                },
                selection: {
                    mode : 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y.2 hits/sec"
                }
            };
        },
        createGraph: function createGraph() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesHitsPerSecond"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotHitsPerSecond"), dataset, options);
            // setup overview
            $.plot($("#overviewHitsPerSecond"), dataset, prepareOverviewOptions(options));
        }
};

// Hits per second
function refreshHitsPerSecond(fixTimestamps) {
    var infos = hitsPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if (isGraph($("#flotHitsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesHitsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotHitsPerSecond", "#overviewHitsPerSecond");
        $('#footerHitsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var codesPerSecondInfos = {
        data: {"result": {"minY": 1.4333333333333333, "minX": 1.77063186E12, "maxY": 57.0, "series": [{"data": [[1.77063186E12, 1.4333333333333333], [1.77063198E12, 52.61666666666667], [1.77063192E12, 57.0]], "isOverall": false, "label": "200", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.77063198E12, "title": "Codes Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendCodesPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "Number of Response Codes %s at %x was %y.2 responses / sec"
                }
            };
        },
    createGraph: function() {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesCodesPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotCodesPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewCodesPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Codes per second
function refreshCodesPerSecond(fixTimestamps) {
    var infos = codesPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotCodesPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesCodesPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotCodesPerSecond", "#overviewCodesPerSecond");
        $('#footerCodesPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var transactionsPerSecondInfos = {
        data: {"result": {"minY": 1.4333333333333333, "minX": 1.77063186E12, "maxY": 57.0, "series": [{"data": [[1.77063186E12, 1.4333333333333333], [1.77063198E12, 52.61666666666667], [1.77063192E12, 57.0]], "isOverall": false, "label": "POST /api/auth/login-success", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.77063198E12, "title": "Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTransactionsPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                }
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTransactionsPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTransactionsPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewTransactionsPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Transactions per second
function refreshTransactionsPerSecond(fixTimestamps) {
    var infos = transactionsPerSecondInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTransactionsPerSecond");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotTransactionsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTransactionsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTransactionsPerSecond", "#overviewTransactionsPerSecond");
        $('#footerTransactionsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var totalTPSInfos = {
        data: {"result": {"minY": 1.4333333333333333, "minX": 1.77063186E12, "maxY": 57.0, "series": [{"data": [[1.77063186E12, 1.4333333333333333], [1.77063198E12, 52.61666666666667], [1.77063192E12, 57.0]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.77063198E12, "title": "Total Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTotalTPS"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                },
                colors: ["#9ACD32", "#FF6347"]
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTotalTPS"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTotalTPS"), dataset, options);
        // setup overview
        $.plot($("#overviewTotalTPS"), dataset, prepareOverviewOptions(options));
    }
};

// Total Transactions per second
function refreshTotalTPS(fixTimestamps) {
    var infos = totalTPSInfos;
    // We want to ignore seriesFilter
    prepareSeries(infos.data, false, true);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 28800000);
    }
    if(isGraph($("#flotTotalTPS"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTotalTPS");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTotalTPS", "#overviewTotalTPS");
        $('#footerTotalTPS .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

// Collapse the graph matching the specified DOM element depending the collapsed
// status
function collapse(elem, collapsed){
    if(collapsed){
        $(elem).parent().find(".fa-chevron-up").removeClass("fa-chevron-up").addClass("fa-chevron-down");
    } else {
        $(elem).parent().find(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-up");
        if (elem.id == "bodyBytesThroughputOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshBytesThroughputOverTime(true);
            }
            document.location.href="#bytesThroughputOverTime";
        } else if (elem.id == "bodyLatenciesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesOverTime(true);
            }
            document.location.href="#latenciesOverTime";
        } else if (elem.id == "bodyCustomGraph") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCustomGraph(true);
            }
            document.location.href="#responseCustomGraph";
        } else if (elem.id == "bodyConnectTimeOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshConnectTimeOverTime(true);
            }
            document.location.href="#connectTimeOverTime";
        } else if (elem.id == "bodyResponseTimePercentilesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimePercentilesOverTime(true);
            }
            document.location.href="#responseTimePercentilesOverTime";
        } else if (elem.id == "bodyResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeDistribution();
            }
            document.location.href="#responseTimeDistribution" ;
        } else if (elem.id == "bodySyntheticResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshSyntheticResponseTimeDistribution();
            }
            document.location.href="#syntheticResponseTimeDistribution" ;
        } else if (elem.id == "bodyActiveThreadsOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshActiveThreadsOverTime(true);
            }
            document.location.href="#activeThreadsOverTime";
        } else if (elem.id == "bodyTimeVsThreads") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTimeVsThreads();
            }
            document.location.href="#timeVsThreads" ;
        } else if (elem.id == "bodyCodesPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCodesPerSecond(true);
            }
            document.location.href="#codesPerSecond";
        } else if (elem.id == "bodyTransactionsPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTransactionsPerSecond(true);
            }
            document.location.href="#transactionsPerSecond";
        } else if (elem.id == "bodyTotalTPS") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTotalTPS(true);
            }
            document.location.href="#totalTPS";
        } else if (elem.id == "bodyResponseTimeVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeVsRequest();
            }
            document.location.href="#responseTimeVsRequest";
        } else if (elem.id == "bodyLatenciesVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesVsRequest();
            }
            document.location.href="#latencyVsRequest";
        }
    }
}

/*
 * Activates or deactivates all series of the specified graph (represented by id parameter)
 * depending on checked argument.
 */
function toggleAll(id, checked){
    var placeholder = document.getElementById(id);

    var cases = $(placeholder).find(':checkbox');
    cases.prop('checked', checked);
    $(cases).parent().children().children().toggleClass("legend-disabled", !checked);

    var choiceContainer;
    if ( id == "choicesBytesThroughputOverTime"){
        choiceContainer = $("#choicesBytesThroughputOverTime");
        refreshBytesThroughputOverTime(false);
    } else if(id == "choicesResponseTimesOverTime"){
        choiceContainer = $("#choicesResponseTimesOverTime");
        refreshResponseTimeOverTime(false);
    }else if(id == "choicesResponseCustomGraph"){
        choiceContainer = $("#choicesResponseCustomGraph");
        refreshCustomGraph(false);
    } else if ( id == "choicesLatenciesOverTime"){
        choiceContainer = $("#choicesLatenciesOverTime");
        refreshLatenciesOverTime(false);
    } else if ( id == "choicesConnectTimeOverTime"){
        choiceContainer = $("#choicesConnectTimeOverTime");
        refreshConnectTimeOverTime(false);
    } else if ( id == "choicesResponseTimePercentilesOverTime"){
        choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        refreshResponseTimePercentilesOverTime(false);
    } else if ( id == "choicesResponseTimePercentiles"){
        choiceContainer = $("#choicesResponseTimePercentiles");
        refreshResponseTimePercentiles();
    } else if(id == "choicesActiveThreadsOverTime"){
        choiceContainer = $("#choicesActiveThreadsOverTime");
        refreshActiveThreadsOverTime(false);
    } else if ( id == "choicesTimeVsThreads"){
        choiceContainer = $("#choicesTimeVsThreads");
        refreshTimeVsThreads();
    } else if ( id == "choicesSyntheticResponseTimeDistribution"){
        choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        refreshSyntheticResponseTimeDistribution();
    } else if ( id == "choicesResponseTimeDistribution"){
        choiceContainer = $("#choicesResponseTimeDistribution");
        refreshResponseTimeDistribution();
    } else if ( id == "choicesHitsPerSecond"){
        choiceContainer = $("#choicesHitsPerSecond");
        refreshHitsPerSecond(false);
    } else if(id == "choicesCodesPerSecond"){
        choiceContainer = $("#choicesCodesPerSecond");
        refreshCodesPerSecond(false);
    } else if ( id == "choicesTransactionsPerSecond"){
        choiceContainer = $("#choicesTransactionsPerSecond");
        refreshTransactionsPerSecond(false);
    } else if ( id == "choicesTotalTPS"){
        choiceContainer = $("#choicesTotalTPS");
        refreshTotalTPS(false);
    } else if ( id == "choicesResponseTimeVsRequest"){
        choiceContainer = $("#choicesResponseTimeVsRequest");
        refreshResponseTimeVsRequest();
    } else if ( id == "choicesLatencyVsRequest"){
        choiceContainer = $("#choicesLatencyVsRequest");
        refreshLatenciesVsRequest();
    }
    var color = checked ? "black" : "#818181";
    if(choiceContainer != null) {
        choiceContainer.find("label").each(function(){
            this.style.color = color;
        });
    }
}

